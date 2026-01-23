import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import {
  CreateBreakoutRoomsReq,
  BreakoutRoom,
  CreateRoomReq,
  NatsMsgServerToClientEvents,
  BreakoutRoomUser,
  RoomMetadata,
  RoomMetadataSchema,
  BreakoutRoomSchema,
  JoinBreakoutRoomReq,
  GenerateTokenReq,
  UserInfo,
  EndBreakoutRoomReq,
  RoomEndReq,
  BroadcastBreakoutRoomMsgReq,
  IncreaseBreakoutRoomDurationReq,
  CreateRoomReqSchema,
  RoomCreateFeaturesSchema,
  GenerateTokenReqSchema,
  UserInfoSchema,
  EndBreakoutRoomReqSchema,
  RoomEndReqSchema,
  BreakoutRoomFeaturesSchema,
} from '@workspace/protocol';
import { RoomCreateService } from '../room/room-create.service';
import { RoomEndService } from '../room/room-end.service';
import { RoomUserService } from '../room/room-user.service';
import {
  create,
  toJsonString,
  fromJson,
  fromJsonString,
} from '@bufbuild/protobuf';
import { v4 as uuidv4 } from 'uuid';
import { RoomDurationService } from '../room/room-duration.service';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import {
  NatsUserService,
  USER_STATUS_ONLINE,
} from '../../interfaces/nats/nats-user.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  AnalyticsDataMsg,
  AnalyticsDataMsgSchema,
  AnalyticsEventType,
  AnalyticsEvents,
} from '@workspace/protocol';

const BREAKOUT_ROOM_FORMAT = '%s-%s';

@Injectable()
export class BreakoutService {
  private readonly logger = new Logger(BreakoutService.name);
  private readonly waitBeforePostStart = 2000; // 2 seconds

  constructor(
    private readonly natsRoomService: NatsRoomService,
    private readonly natsSystemEvents: NatsSystemEventsService,
    private readonly roomCreateService: RoomCreateService,
    @Inject(forwardRef(() => RoomEndService))
    private readonly roomEndService: RoomEndService,
    private readonly roomDurationService: RoomDurationService,
    private readonly natsService: NatsService,
    private readonly natsUserService: NatsUserService,
    private readonly liveKitService: LiveKitService,
    private readonly analyticsService: AnalyticsService,
    private readonly natsRoomEventsService: NatsRoomEventsService,
    @Inject(forwardRef(() => RoomUserService))
    private readonly roomUserService: RoomUserService,
  ) { }

  /**
   * CreateBreakoutRooms creates multiple breakout rooms under a parent room
   */
  async createBreakoutRooms(req: CreateBreakoutRoomsReq): Promise<void> {
    this.logger.log(
      `Creating breakout rooms for parent room: ${req.roomId}, count: ${req.rooms.length}`,
    );

    // 1. Get Parent Room Info & Metadata
    const { info: mainRoom, metadata: meta } =
      await this.natsRoomService.getRoomInfoWithMetadata(req.roomId);

    if (!mainRoom || !meta) {
      throw new Error('Invalid parent room information');
    }

    // 2. Duration Check
    if (
      meta.roomFeatures?.roomDuration &&
      Number(meta.roomFeatures.roomDuration) > 0
    ) {
      await this.roomDurationService.compareDurationWithParentRoom(
        req.roomId,
        Number(req.duration),
      );
    }

    // 3. Prepare Sub-Room Metadata Template
    const bMeta = create(RoomMetadataSchema, meta);
    if (!bMeta.roomFeatures)
      bMeta.roomFeatures = create(RoomCreateFeaturesSchema, {});

    bMeta.roomFeatures.roomDuration = req.duration.toString();
    bMeta.isBreakoutRoom = true;
    bMeta.welcomeMessage = req.welcomeMsg;
    bMeta.parentRoomId = req.roomId;

    // disable few features
    if (!bMeta.roomFeatures.breakoutRoomFeatures) {
      bMeta.roomFeatures.breakoutRoomFeatures = create(BreakoutRoomFeaturesSchema, {});
    }
    bMeta.roomFeatures.breakoutRoomFeatures.isAllow = false;

    if (bMeta.roomFeatures.waitingRoomFeatures)
      bMeta.roomFeatures.waitingRoomFeatures.isActive = false;

    if (bMeta.roomFeatures.recordingFeatures)
      bMeta.roomFeatures.recordingFeatures.isAllow = false;

    bMeta.roomFeatures.allowRtmp = false;

    if (bMeta.roomFeatures.displayExternalLinkFeatures)
      bMeta.roomFeatures.displayExternalLinkFeatures.isActive = false;
    if (bMeta.roomFeatures.externalMediaPlayerFeatures)
      bMeta.roomFeatures.externalMediaPlayerFeatures.isActive = false;

    if (req.rooms.length === 0) {
      throw new Error('no breakout rooms provided');
    }

    const e: Record<string, boolean> = {};

    for (const room of req.rooms) {
      // BREAKOUT_ROOM_FORMAT %s-%s
      const bRoomId = `${req.roomId}-${room.id}`;

      const bRoomReq = create(CreateRoomReqSchema, {
        roomId: bRoomId,
        metadata: create(RoomMetadataSchema, {
          ...bMeta,
          roomTitle: room.title,
        }),
      });

      try {
        await this.roomCreateService.createRoom(bRoomReq);

        room.duration = req.duration.toString();
        room.created = Math.floor(Date.now() / 1000).toString();

        const roomJson = this.natsService.marshalToProtoJson(room, BreakoutRoomSchema);
        await this.natsRoomService.insertOrUpdateBreakoutRoom(req.roomId, bRoomId, new TextEncoder().encode(roomJson));

        // send invitation notification
        for (const u of room.users) {
          await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.JOIN_BREAKOUT_ROOM,
            req.roomId,
            bRoomId, // payload
            u.id
          );
        }

      } catch (error) {
        this.logger.error(`Failed to create breakout room ${bRoomId}: ${error.message}`);
        e[bRoomId] = true;
        continue;
      }
    }

    if (Object.keys(e).length === req.rooms.length) {
      throw new Error("breakout room creation wasn't successful for any room");
    }

    // Update parent room metadata
    // Reload original meta or use 'meta' from start (it's object ref but we cloned 'bMeta' from it)
    // It re-parses from original query.
    // In TS, `meta` is the object from `getRoomInfoWithMetadata`.
    // We can use `meta` directly but ensure we enable breakout feature.

    // Update parent room metadata on success
    try {
      // Re-fetch parent metadata to ensure we have fresh data
      const origMeta = await this.natsRoomService.getRoomMetadataStruct(req.roomId);
      if (origMeta) {
        if (!origMeta.roomFeatures) origMeta.roomFeatures = create(RoomCreateFeaturesSchema, {});
        if (!origMeta.roomFeatures.breakoutRoomFeatures) {
          origMeta.roomFeatures.breakoutRoomFeatures = create(BreakoutRoomFeaturesSchema, {});
        }
        origMeta.roomFeatures.breakoutRoomFeatures.isActive = true;

        await this.natsRoomEventsService.updateAndBroadcastRoomMetadata(req.roomId, origMeta);
      }
    } catch (error) {
      this.logger.error(`Failed to update parent room metadata: ${error.message}`);
    }

    // Send analytics
    const analyticsData = create(AnalyticsDataMsgSchema, {
      eventType: AnalyticsEventType.ROOM,
      eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_BREAKOUT_ROOM,
      roomId: req.roomId,
    });
    this.analyticsService.handleEvent(analyticsData);

    this.logger.log('Finished creating breakout rooms');
  }

  /**
   * JoinBreakoutRoom validates and generates token for joining a breakout room
   */
  async joinBreakoutRoom(req: JoinBreakoutRoomReq): Promise<string> {
    this.logger.log(
      `User ${req.userId} requesting to join breakout room ${req.breakoutRoomId}`,
    );

    // 1. Check if user already joined
    const status = await this.natsUserService.getRoomUserStatus(
      req.breakoutRoomId,
      req.userId,
    );
    if (status === USER_STATUS_ONLINE) {
      throw new Error('User has already been joined');
    }

    // 2. Fetch Breakout Room Info
    const roomBytes = await this.natsRoomService.getBreakoutRoom(
      req.roomId,
      req.breakoutRoomId,
    );
    if (!roomBytes) {
      throw new Error('Failed to fetch breakout room info');
    }

    const room = fromJsonString(
      BreakoutRoomSchema,
      new TextDecoder().decode(roomBytes),
    );

    // 3. Authorization Check (Unless Admin)
    if (!req.isAdmin) {
      const canJoin = room.users.some((u) => u.id === req.userId);
      if (!canJoin) {
        throw new Error('User is not allowed to join this breakout room');
      }
    }

    // 4. Get User Info from Parent Room
    const pInfo = await this.natsUserService.getUser(req.roomId, req.userId);
    const pMeta = await this.natsUserService.getUserMetadataStruct(
      req.roomId,
      req.userId,
    );
    if (!pInfo || !pMeta) {
      throw new Error('Failed to get user info from parent room');
    }

    // Prepare GenerateTokenReq for RoomUserService
    // IMPORTANT: Use metadata from parent room, NOT from request
    const joinReq = {
      roomId: req.breakoutRoomId,
      userInfo: {
        userId: req.userId,
        name: pInfo.name,
        isAdmin: pMeta.isAdmin,  // Use parent room admin status only
        userMetadata: pMeta,
      },
    };

    const { token } = await this.roomUserService.getWajlcJoinToken(joinReq);
    return token;
  }

  /**
   * EndBreakoutRoom ends a specific breakout room via RoomEndService
   */
  async endBreakoutRoom(req: EndBreakoutRoomReq): Promise<void> {
    this.logger.log(
      `Ending breakout room ${req.breakoutRoomId} for parent ${req.roomId}`,
    );

    const rm = await this.natsRoomService.getBreakoutRoom(
      req.roomId,
      req.breakoutRoomId,
    );
    if (!rm) {
      throw new Error('Breakout room not found');
    }

    // Use core end room logic
    await this.roomEndService.endRoom(
      create(RoomEndReqSchema, { roomId: req.breakoutRoomId }),
    );

    // Delete from NATS KV
    await this.natsRoomService.deleteBreakoutRoom(
      req.roomId,
      req.breakoutRoomId,
    );

    // Post-End Cleanup & Notification
    await this.onAfterBkRoomEnded(req.roomId, req.breakoutRoomId);
  }

  /**
   * EndAllBreakoutRooms ends all sub-rooms for a parent room
   */
  async endAllBreakoutRooms(parentRoomId: string): Promise<void> {
    this.logger.log(`Ending all breakout rooms for ${parentRoomId}`);

    const ids =
      await this.natsRoomService.getBreakoutRoomIdsByParentRoomId(parentRoomId);
    if (!ids || ids.length === 0) {
      await this.updateParentRoomMetadataOnEnd(parentRoomId);
      return;
    }

    for (const id of ids) {
      await this.roomEndService.endRoom(
        create(RoomEndReqSchema, { roomId: id }),
      );
      await this.natsRoomService.deleteBreakoutRoom(parentRoomId, id);
      await this.onAfterBkRoomEnded(parentRoomId, id);
    }
  }

  /**
   * GetBreakoutRoomsInfo returns list of breakout rooms
   */
  async getBreakoutRoomsInfo(roomId: string): Promise<BreakoutRoom[]> {
    const roomsData =
      await this.natsRoomService.getAllBreakoutRoomsByParentRoomId(roomId);
    const result: BreakoutRoom[] = [];

    for (const [key, val] of Object.entries(roomsData)) {
      try {
        const room = fromJsonString(
          BreakoutRoomSchema,
          new TextDecoder().decode(val),
        );
        room.id = key; // Ensure ID matches map key

        // Check online status of users
        if (room.started) {
          for (const u of room.users) {
            const status = await this.natsUserService.getRoomUserStatus(
              key,
              u.id,
            );
            if (status === USER_STATUS_ONLINE) {
              u.joined = true;
            }
          }
        }
        result.push(room);
      } catch (e) {
        this.logger.warn(`Failed to parse breakout room ${key}: ${e.message}`);
      }
    }
    return result;
  }

  /**
   * GetMyBreakoutRoom gets the breakout room a user belongs to
   */
  async getMyBreakoutRoom(
    roomId: string,
    userId: string,
  ): Promise<BreakoutRoom | undefined> {
    const breakoutRooms = await this.getBreakoutRoomsInfo(roomId);
    if (!breakoutRooms || breakoutRooms.length === 0) {
      throw new Error('no breakout rooms found');
    }

    for (const rr of breakoutRooms) {
      for (const u of rr.users) {
        if (u.id === userId) {
          return rr;
        }
      }
    }

    throw new Error('not found');
  }

  /**
   * IncreaseBreakoutRoomDuration extends duration
   */
  async increaseBreakoutRoomDuration(
    req: IncreaseBreakoutRoomDurationReq,
  ): Promise<void> {
    const roomBytes = await this.natsRoomService.getBreakoutRoom(
      req.roomId,
      req.breakoutRoomId,
    );
    if (!roomBytes) throw new Error('Breakout room not found');

    const room = fromJsonString(
      BreakoutRoomSchema,
      new TextDecoder().decode(roomBytes),
    );

    // Update active duration checker
    const newDuration = await this.roomDurationService.increaseRoomDuration(
      req.breakoutRoomId,
      Number(req.duration),
    );

    // Update KV
    room.duration = newDuration.toString();
    const jsonStr = this.natsService.marshalToProtoJson(room, BreakoutRoomSchema);

    await this.natsRoomService.insertOrUpdateBreakoutRoom(
      req.roomId,
      req.breakoutRoomId,
      new TextEncoder().encode(jsonStr),
    );
  }

  /**
   * BroadcastBreakoutRoomMsg sends a system message to all breakout rooms
   */
  async broadcastBreakoutRoomMsg(
    req: BroadcastBreakoutRoomMsgReq,
  ): Promise<void> {
    const rooms = await this.getBreakoutRoomsInfo(req.roomId);
    if (rooms.length === 0) return;

    for (const r of rooms) {
      await this.natsSystemEvents.broadcastSystemEventToRoom(
        NatsMsgServerToClientEvents.SYSTEM_CHAT_MSG,
        r.id,
        req.msg,
      );
    }
  }

  /**
   * PostTaskAfterRoomStartWebhook handles post-start updates (setting created time, etc.)
   */
  async postTaskAfterRoomStartWebhook(
    roomId: string,
    metadata: RoomMetadata,
  ): Promise<void> {
    if (!metadata.isBreakoutRoom || !metadata.parentRoomId) return;

    // Delay to allow sync
    await new Promise((resolve) =>
      setTimeout(resolve, this.waitBeforePostStart),
    );

    const roomBytes = await this.natsRoomService.getBreakoutRoom(
      metadata.parentRoomId,
      roomId,
    );
    if (!roomBytes) return;

    const room = fromJsonString(
      BreakoutRoomSchema,
      new TextDecoder().decode(roomBytes),
    );
    room.created = metadata.startedAt.toString();
    room.started = true;

    const jsonStr = this.natsService.marshalToProtoJson(room, BreakoutRoomSchema);
    await this.natsRoomService.insertOrUpdateBreakoutRoom(
      metadata.parentRoomId,
      roomId,
      new TextEncoder().encode(jsonStr),
    );
  }

  /**
   * PostTaskAfterRoomEndWebhook handles cleanup when a room ends
   */
  async postTaskAfterRoomEndWebhook(
    roomId: string,
    metadata: string,
  ): Promise<void> {
    if (!metadata) return;

    const meta = this.natsService.unmarshalRoomMetadata(metadata);

    if (meta.isBreakoutRoom && meta.parentRoomId) {
      // A single breakout room ended
      await this.natsRoomService.deleteBreakoutRoom(meta.parentRoomId, roomId);
      await this.onAfterBkRoomEnded(meta.parentRoomId, roomId);
    } else {
      // Parent room ended, kill all sub-rooms
      await this.endAllBreakoutRooms(roomId);
    }
  }

  // ================= PRIVATE METHODS =================

  private async onAfterBkRoomEnded(parentRoomId: string, bkRoomId: string) {
    const count = await this.natsRoomService.countBreakoutRooms(parentRoomId);

    if (count === 0) {
      // No rooms left, cleanup parent metadata
      await this.natsRoomService.deleteAllBreakoutRoomsByParentRoomId(
        parentRoomId,
      );
      await this.updateParentRoomMetadataOnEnd(parentRoomId);
    }

    // Notify parent room
    await this.natsSystemEvents.broadcastSystemEventToRoom(
      NatsMsgServerToClientEvents.BREAKOUT_ROOM_ENDED,
      parentRoomId,
      bkRoomId,
    );
  }

  private async updateParentRoomMetadataOnEnd(parentRoomId: string) {
    const meta = await this.natsRoomService.getRoomMetadataStruct(parentRoomId);
    if (!meta) return;

    if (meta.roomFeatures?.breakoutRoomFeatures?.isActive) {
      meta.roomFeatures.breakoutRoomFeatures.isActive = false;

      await this.natsRoomEventsService.updateAndBroadcastRoomMetadata(parentRoomId, meta);
    }
  }
}
