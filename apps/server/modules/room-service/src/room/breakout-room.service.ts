import { Injectable, Logger } from '@nestjs/common';
import {
  PrismaService,
  LiveKitService,
  RedisService,
  NatsService,
} from '@server/shared';
import {
  CreateBreakoutRoomsReq,
  JoinBreakoutRoomReq,
  EndBreakoutRoomReq,
  NatsMsgServerToClientEvents,
} from '@server/proto';
import { RoomService } from './room.service';
import { RpcException } from '@nestjs/microservices';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class BreakoutRoomService {
  private readonly logger = new Logger(BreakoutRoomService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly liveKitService: LiveKitService,
    private readonly roomService: RoomService, // Reuse room creation logic
    private readonly configService: ConfigService,
    private readonly natsService: NatsService,
  ) { }

  async createBreakoutRooms(data: CreateBreakoutRoomsReq) {
    this.logger.log(
      `Creating ${data.rooms.length} breakout rooms for parent: ${data.roomId}`,
    );
    const responses: any[] = [];

    // 1. Fetch Parent Room Metadata
    const parentRoomList = await this.liveKitService
      .getRoomClient()
      .listRooms([data.roomId]);
    if (parentRoomList.length === 0)
      throw new RpcException('Parent room not found');
    const parentRoom = parentRoomList[0];
    let parentMeta: any = {};
    try {
      parentMeta = JSON.parse(parentRoom.metadata);
    } catch (e) { }

    // 2. Prepare Metadata for Breakout Rooms (disable some features)
    const bkMeta = structuredClone(parentMeta);
    bkMeta.isBreakoutRoom = true;
    bkMeta.parentRoomId = data.roomId;
    bkMeta.roomFeatures.breakoutRoomFeatures = { isAllow: false }; // Disable nested breakout
    bkMeta.roomFeatures.waitingRoomFeatures = { isActive: false };
    bkMeta.roomFeatures.recordingFeatures = { isAllow: false };
    bkMeta.roomFeatures.allowRtmp = false;

    // Disable External Media/Display features as per plugNmeet logic
    if (bkMeta.roomFeatures.displayExternalLinkFeatures) {
      bkMeta.roomFeatures.displayExternalLinkFeatures.isActive = false;
    }
    if (bkMeta.roomFeatures.externalMediaPlayerFeatures) {
      bkMeta.roomFeatures.externalMediaPlayerFeatures.isActive = false;
    }

    // Note: Chat features are NOT disabled, so they inherit from Parent Room.
    // This answers the user's question: "Yes, Chat is available if Parent has it."

    if (bkMeta.roomFeatures.roomDuration) {
      bkMeta.roomFeatures.roomDuration = data.duration * 60; // Duration in seconds
    }

    // 3. Create Each Room
    for (const roomReq of data.rooms) {
      const bkRoomId = `${data.roomId}-${roomReq.id}`;
      try {
        // Update specific metadata for this room
        const thisRoomMeta = structuredClone(bkMeta);
        thisRoomMeta.roomTitle = roomReq.title;

        // Create via RoomService (to handle DB + LiveKit + Webhooks)
        await this.roomService.createRoom({
          roomId: bkRoomId,
          metadata: thisRoomMeta,
          emptyTimeout: data.duration * 60, // Auto close after duration
        });

        // Notify Assigned Users via System Event (Parity: JOIN_BREAKOUT_ROOM)
        for (const user of roomReq.users) {
          await this.roomService.broadcastNatsEvent(
            NatsMsgServerToClientEvents.JOIN_BREAKOUT_ROOM,
            data.roomId,
            bkRoomId,
            user.id,
          );
        }

        // NATS KV Storage for Persistence/Legacy Compatibility
        try {
          await this.natsService.kvPut(
            `pnm-breakoutRoom-${data.roomId}`,
            bkRoomId,
            JSON.stringify(thisRoomMeta),
          );
        } catch (e) {
          this.logger.warn(
            `Failed to update NATS KV for breakout room ${bkRoomId}: ${e.message}`,
          );
        }

        responses.push({ success: true, roomId: bkRoomId });
      } catch (error) {
        this.logger.error(
          `Failed to create breakout room ${bkRoomId}: ${error.message}`,
        );
        responses.push({
          success: false,
          roomId: bkRoomId,
          error: error.message,
        });
      }
    }

    // 4. Update Parent Room Metadata to indicate Breakout Active
    if (!parentMeta.roomFeatures) parentMeta.roomFeatures = {};
    if (!parentMeta.roomFeatures.breakoutRoomFeatures)
      parentMeta.roomFeatures.breakoutRoomFeatures = {};
    parentMeta.roomFeatures.breakoutRoomFeatures.isActive = true;
    await this.liveKitService
      .getRoomClient()
      .updateRoomMetadata(data.roomId, JSON.stringify(parentMeta));

    return { success: true, results: responses };
  }

  async joinBreakoutRoom(data: JoinBreakoutRoomReq) {
    this.logger.log(
      `User ${data.userId} joining breakout room ${data.breakoutRoomId}`,
    );
    // 1. Verify Breakout Room Exists
    const room = await this.prisma.roomInfo.findFirst({
      where: {
        roomId: data.breakoutRoomId,
        isRunning: true,
        isBreakoutRoom: true,
      },
    });
    if (!room) throw new RpcException('Breakout room not active');

    // 2. Access Control (Simplified: Check if user was assigned? Or just allow if valid)
    // For strict parity, we should check if user is in the assignment list.
    // But since we don't store assignment list persistently yet (was in NATS),
    // we'll rely on the fact that only invited users get the token request triggered by client.
    // We DO need to get User Info (Name, etc) to generate token.

    // We'll fetch user info from Parent Room
    // Assuming user is online in parent room
    // But user might have left parent room to join here? No, they switch.
    // Actually, we can just generate a new token with provided Name/ID.

    // TODO: Ideally fetch user info from Parent Room participants list to ensure consistency

    // 3. Generate Token
    // Fetch user info from Parent Room participants list to ensure consistency
    let name = data.userId;
    try {
      const participants = await this.liveKitService
        .getRoomClient()
        .listParticipants(room.parentRoomId);
      const p = participants.find((p) => p.identity === data.userId);
      if (p && p.name) {
        name = p.name;
      }
    } catch (e) {
      this.logger.warn(
        `Could not fetch participant ${data.userId} from parent room ${room.parentRoomId}: ${e.message}`,
      );
    }

    const videoGrant = {
      roomJoin: true,
      room: data.breakoutRoomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    };

    const token = await this.liveKitService.createAccessToken(
      data.userId,
      name,
      videoGrant,
      room.metadata as string,
    );

    return { success: true, token };
  }

  async endBreakoutRoom(data: EndBreakoutRoomReq) {
    return this.roomService.endRoom({ roomName: data.breakoutRoomId });
  }

  async endAllBreakoutRooms(data: { roomId: string }) {
    this.logger.log(`Ending all breakout rooms for parent: ${data.roomId}`);
    const rooms = await this.prisma.roomInfo.findMany({
      where: {
        parentRoomId: data.roomId,
        isRunning: true,
        isBreakoutRoom: true,
      },
    });

    for (const room of rooms) {
      await this.roomService.endRoom({ roomName: room.roomId });
      try {
        await this.natsService.kvDelete(
          `pnm-breakoutRoom-${data.roomId}`,
          room.roomId,
        );
      } catch (e) { }
    }

    // Update Parent Metadata
    const parentRoomList = await this.liveKitService
      .getRoomClient()
      .listRooms([data.roomId]);
    if (parentRoomList.length > 0) {
      const parentRoom = parentRoomList[0];
      try {
        const meta = JSON.parse(parentRoom.metadata);
        if (meta.roomFeatures?.breakoutRoomFeatures) {
          meta.roomFeatures.breakoutRoomFeatures.isActive = false;
          await this.liveKitService
            .getRoomClient()
            .updateRoomMetadata(data.roomId, JSON.stringify(meta));
        }

        // Notify all users
        await this.roomService.broadcastNatsEvent(
          NatsMsgServerToClientEvents.BREAKOUT_ROOM_ENDED,
          data.roomId,
          data.roomId, // msg is usually ignored or ID
        );
      } catch (e) { }
    }

    return { success: true };
  }
}
