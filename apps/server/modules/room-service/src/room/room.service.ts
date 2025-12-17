import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  PrismaService,
  LiveKitService,
  RedisService,
  NatsService,
} from '@server/shared';
import { EncodedFileOutput, EncodedFileType } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateRoomReq,
  CreateIngressReq,
  ApproveWaitingUsersReq,
  UpdateWaitingRoomMessageReq,
} from '@workspace/protocol';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  AnalyticsEvents,
  AnalyticsEventType,
  NatsKvRoomInfo,
  NatsKvUserInfo,
  NatsMsgServerToClient,
  NatsMsgServerToClientEvents,
  RoomMetadata,
} from '@workspace/protocol';
import { RoomUtils } from './room.utils';

@Injectable()
export class RoomService implements OnModuleInit {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly liveKitService: LiveKitService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly natsService: NatsService,
    private readonly analyticsService: AnalyticsService,
  ) { }

  async onModuleInit() {
    // Subscribe to chat subject for room-based chat messages
    await this.natsService.subscribe('chat', 'chat-durable', (msg) => {
      this.handleChatMessage(msg);
    });
    this.logger.log('RoomService subscribed to NATS subject: chat');
  }

  private handleChatMessage(msg: any) {
    try {
      // Log received chat message
      this.logger.debug(
        `Received chat message. Content size: ${msg.data.length}`,
      );
      // Future: Add chat message processing logic here (DB storage, filtering, etc.)
    } catch (e) {
      this.logger.error('Error handling chat message', e);
    }
  }

  async createRoom(data: CreateRoomReq) {
    const lockKey = `room_creation_lock:${data.roomId}`;
    const acquired = await this.redisService.acquireLock(lockKey, 'locked', 5);
    if (!acquired) {
      // Retry once after short delay (simple retry logic)
      await new Promise((r) => setTimeout(r, 200));
      const retry = await this.redisService.acquireLock(lockKey, 'locked', 5);
      if (!retry) {
        throw new RpcException('Room creation in progress, try again');
      }
    }

    try {
      const roomId = data.roomId || (data as any).room_id;
      if (!roomId) throw new RpcException('Room ID is required');

      this.logger.log(`Creating room: ${roomId}`);

      // Check if room exists in DB
      const existingRoom = await this.prisma.roomInfo.findFirst({
        where: { roomId: roomId, isRunning: true },
      });

      if (existingRoom) {
        // Check NATS for liveness (Go Parity)
        const rInfo = await this.natsService.getRoomInfo(roomId);
        if (rInfo && rInfo.roomId) {
          this.logger.log(
            `Room ${roomId} found active in NATS. Returning existing info.`,
          );
          // Ensure streams are active (Go logic)
          await this.createRoomNatsStreams(roomId);

          // Return existing room info
          const activeRoomInfo = RoomUtils.toActiveRoomInfo(
            {
              roomId: existingRoom.roomId,
              sid: existingRoom.sid,
              roomTitle: existingRoom.roomTitle,
              creationTime: Number(existingRoom.creationTime),
              metadata: existingRoom.metadata as string,
              webhookUrl: existingRoom.webhookUrl,
            },
            JSON.parse((existingRoom.metadata as string) || '{}'),
          );

          return {
            status: true,
            room_info: activeRoomInfo,
            msg: 'Room already active',
          };
        } else {
          this.logger.warn(
            `Room ${roomId} found in DB but not in NATS (stale). Creating new session.`,
          );
          // Proceed to create new room...
        }
      }

      // Initialize defaults using RoomUtils (Go parity)
      // We gather config from ConfigService
      const roomConfig = {
        copyrightConf: this.configService.get('COPYRIGHT_CONF'), // Assuming loaded as object or we map it
        insightsEnabled: !!this.configService.get('INSIGHTS_ENABLED'),
        speechToTextEnabled: !!this.configService.get('SPEECH_TO_TEXT_ENABLED'),
        maxSelectedOneTimeTransLangs: 2, // Default or fetch from config
        maxNumTranLangsAllowSelecting: 2,
        roomDefaultSettings: {
          maxParticipants: this.configService.get('MAX_PARTICIPANTS'),
          maxDuration: this.configService.get('MAX_DURATION'),
          maxNumBreakoutRooms: 16,
        },
      };

      RoomUtils.setRoomDefaults(data, roomConfig);

      const metadataJson = data.metadata
        ? JSON.stringify(RoomUtils.toProtocolMetadata(data.metadata))
        : '{}';

      // Create in LiveKit
      const room = await this.liveKitService.getRoomClient().createRoom({
        name: roomId,
        emptyTimeout: data.emptyTimeout || 60 * 60, // 1 hour default
        maxParticipants: data.maxParticipants || 100,
        metadata: metadataJson,
      });

      // Save to DB
      const dbRoom = await this.prisma.roomInfo.create({
        data: {
          roomId: room.name,
          sid: room.sid,
          roomTitle: data.metadata?.roomTitle || roomId,
          isRunning: true,
          creationTime: Number(room.creationTime),
          metadata: metadataJson,
        },
      });

      // NATS KV Sync
      // Use snake_case manual object for NATS
      await this.natsService.updateRoomInfo(
        room.name,
        RoomUtils.getSnakeCaseNatsKvRoomInfo(
          {
            roomId: room.name,
            sid: room.sid,
            creationTime: Number(room.creationTime),
            metadata: metadataJson,
          },
          data,
        ),
      );

      // Create NATS Streams
      await this.createRoomNatsStreams(room.name);

      // Add room to NATS KV (Match Go: AddRoom)
      this.logger.log(`Adding room to NATS KV: ${room.name}`);
      await this.natsService.addRoom(
        dbRoom.id.toString(),
        dbRoom.roomId,
        dbRoom.sid,
        data.emptyTimeout || 0,
        data.maxParticipants || 0,
        data.metadata as any,
      );
      this.logger.log(`Room ${room.name} added to NATS KV`);

      // Analytics
      await this.analyticsService.sendAnalyticsData({
        eventType: AnalyticsEventType.ANALYTICS_EVENT_TYPE_ROOM,
        eventName: AnalyticsEvents.ANALYTICS_EVENT_UNKNOWN,
        roomId: room.name,
        roomSid: room.sid,
        time: Date.now(),
        eventValueString: 'created',
      } as any);

      // Return ActiveRoomInfo (snake_case)
      const activeRoomInfo = RoomUtils.toActiveRoomInfo(
        {
          roomId: dbRoom.roomId,
          sid: dbRoom.sid,
          roomTitle: dbRoom.roomTitle,
          creationTime: Number(dbRoom.creationTime),
          metadata: dbRoom.metadata as string,
          webhookUrl: data.metadata?.webhookUrl,
        },
        data.metadata as any,
      );

      // Send Webhook (Go Parity)
      this.sendRoomCreatedWebhook(
        activeRoomInfo,
        data.emptyTimeout,
        data.maxParticipants,
      );

      return { status: true, msg: 'success', room_info: activeRoomInfo };
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`);
      throw new RpcException(error.message);
    } finally {
      await this.redisService.releaseLock(lockKey, 'locked');
    }
  }

  private async createRoomNatsStreams(roomId: string) {
    const subjects = [
      `${roomId}:pnm.chat.*`,
      `${roomId}:pnm.system.public.*`,
      `${roomId}:pnm.system.private.*.*`,
      `${roomId}:pnm.whiteboard.*`,
      `${roomId}:pnm.datachannel.*`,
    ];
    await this.natsService.createStream(roomId, subjects);
  }

  async endRoom(data: { roomId: string }) {
    try {
      this.logger.log(`Ending room: ${data.roomId}`);
      await this.liveKitService.getRoomClient().deleteRoom(data.roomId);

      await this.prisma.roomInfo.updateMany({
        where: { roomId: data.roomId, isRunning: true },
        data: { isRunning: false, endedAt: new Date() },
      });

      // NATS KV Sync
      await this.natsService.updateRoomInfo(data.roomId, {
        status: 'ended',
      });

      // Analytics
      await this.analyticsService.sendAnalyticsData({
        eventType: AnalyticsEventType.ANALYTICS_EVENT_TYPE_ROOM,
        eventName: AnalyticsEvents.ANALYTICS_EVENT_UNKNOWN,
        roomId: data.roomId,
        time: Date.now(),
        eventValueString: 'ended',
      } as any);

      return { success: true, message: 'Room ended' };
    } catch (error) {
      this.logger.error(`Error ending room: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async getRoomStatus(data: { roomId: string }) {
    const roomId =
      data.roomId || (data as any).room_id || (data as any).roomName;
    if (!roomId) return { isRunning: false, room: null };
    const room = await this.prisma.roomInfo.findFirst({
      where: { roomId: roomId, isRunning: true },
    });
    return { isRunning: !!room, room };
  }

  async getJoinToken(data: any) {
    const { room_id, user_info } = data;
    if (!room_id || !user_info) {
      return { status: false, msg: 'room_id and user_info are required' };
    }

    // 1. Check if room active
    const roomInfo = await this.prisma.roomInfo.findFirst({
      where: { roomId: room_id, isRunning: true },
    });

    if (!roomInfo) {
      return { status: false, msg: 'room is not active. create room first' };
    }

    // 2. Generate Token
    // TODO: Check blocked users via NATS (skipped for now as parity gap)

    // LiveKit Token generation
    // UserInfo: user_id, name, is_admin, user_metadata

    const grants = {
      roomJoin: true,
      room: room_id,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: user_info.is_admin,
    };

    const token = await this.liveKitService.createAccessToken(
      user_info.user_id,
      user_info.name,
      grants,
      user_info.user_metadata
        ? JSON.stringify(user_info.user_metadata)
        : undefined,
    );

    return {
      status: true,
      msg: 'success',
      token,
    };
  }

  async listRooms() {
    return this.prisma.roomInfo.findMany({
      where: { isRunning: true },
    });
  }

  async handleWebhookEvent(event: any) {
    if (!event || !event.room) return;
    const roomId = event.room.name;
    const eventType = event.event;

    try {
      switch (eventType) {
        case 'room_started':
          await this.prisma.roomInfo.upsert({
            where: { sid: event.room.sid },
            update: { isRunning: true },
            create: {
              roomId: roomId,
              sid: event.room.sid,
              roomTitle: roomId,
              isRunning: true,
              creationTime: Number(event.room.creationTime),
            },
          });
          await this.analyticsService.sendAnalyticsData({
            eventType: AnalyticsEventType.ANALYTICS_EVENT_TYPE_ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_UNKNOWN,
            roomId: roomId,
            roomSid: event.room.sid,
            time: Date.now(),
            eventValueString: 'started',
          } as any);
          break;

        case 'room_finished':
          await this.prisma.roomInfo.updateMany({
            where: { sid: event.room.sid },
            data: { isRunning: false, endedAt: new Date() },
          });
          await this.analyticsService.sendAnalyticsData({
            eventType: AnalyticsEventType.ANALYTICS_EVENT_TYPE_ROOM,
            eventName: AnalyticsEvents.ANALYTICS_EVENT_UNKNOWN,
            roomId: roomId,
            roomSid: event.room.sid,
            time: Date.now(),
            eventValueString: 'finished',
          } as any);
          break;

        case 'participant_joined':
          await this.prisma.roomInfo.updateMany({
            where: { sid: event.room.sid },
            data: { joinedParticipants: { increment: 1 } },
          });
          if (event.participant) {
            const user = event.participant;
            await this.natsService.updateUserInfo(roomId, user.identity, {
              userId: user.identity,
              name: user.name,
              isAdmin: user.permission?.hidden || false,
              isPresenter: user.permission?.canPublish || false,
              metadata: user.metadata,
              joinedAt: user.joinedAt * 1000,
              roomId: roomId,
            } as any);

            // Create NATS Consumers
            await this.createNatsConsumers(roomId, user.identity);

            await this.analyticsService.sendAnalyticsData({
              eventType: AnalyticsEventType.ANALYTICS_EVENT_TYPE_USER,
              eventName: AnalyticsEvents.ANALYTICS_EVENT_USER_JOINED,
              roomId: roomId,
              roomSid: event.room.sid,
              userId: user.identity,
              userName: user.name,
              time: Date.now(),
              extraData: user.metadata,
            } as any);
          }
          break;

        case 'participant_left':
          await this.prisma.roomInfo.updateMany({
            where: { sid: event.room.sid },
            data: { joinedParticipants: { decrement: 1 } },
          });
          if (event.participant) {
            await this.natsService.deleteUserInfo(
              roomId,
              event.participant.identity,
            );
            await this.analyticsService.sendAnalyticsData({
              eventType: AnalyticsEventType.ANALYTICS_EVENT_TYPE_USER,
              eventName: AnalyticsEvents.ANALYTICS_EVENT_USER_LEFT,
              roomId: roomId,
              roomSid: event.room.sid,
              userId: event.participant.identity,
              userName: event.participant.name,
              time: Date.now(),
            } as any);
          }
          break;

        case 'egress_ended': // Recording finished
          if (event.egress && event.egress.file) {
            const recordingInfo = event.egress;
            await this.prisma.recording.create({
              data: {
                recordId: recordingInfo.egressId,
                roomSid: recordingInfo.roomSid,
                roomId: roomId,
                recorderId: recordingInfo.egressId,
                filePath: recordingInfo.file.location,
                size: Number(recordingInfo.file.size),
                roomCreationTime: 0,
                creationTime: Number(recordingInfo.startedAt) || 0,
              },
            });
            await this.analyticsService.sendAnalyticsData({
              eventType: AnalyticsEventType.ANALYTICS_EVENT_TYPE_ROOM,
              eventName: AnalyticsEvents.ANALYTICS_EVENT_ROOM_RECORDING_STATUS,
              roomId: roomId,
              roomSid: event.room.sid,
              time: Date.now(),
              eventValueString: 'ended',
            } as any);
          }
          break;
      }
    } catch (error) {
      this.logger.error(
        `Error handling webhook event ${eventType}: ${error.message}`,
      );
    }
  }

  async fetchRecordings(data: {
    roomIds?: string[];
    from?: number;
    limit?: number;
    orderBy?: 'ASC' | 'DESC';
  }) {
    const { roomIds, from = 0, limit = 20, orderBy = 'DESC' } = data;
    const where =
      roomIds && roomIds.length > 0 ? { roomId: { in: roomIds } } : {};

    try {
      const [total, recordings] = await Promise.all([
        this.prisma.recording.count({ where }),
        this.prisma.recording.findMany({
          where,
          skip: from,
          take: limit,
          orderBy: { creationTime: orderBy.toLowerCase() as 'asc' | 'desc' },
        }),
      ]);

      return {
        totalRecordings: total,
        from,
        limit,
        orderBy,
        recordingsList: recordings,
      };
    } catch (error) {
      this.logger.error(`Error fetching recordings: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async deleteRecording(data: { recordId: string }) {
    try {
      const recording = await this.prisma.recording.findUnique({
        where: { recordId: data.recordId },
      });

      if (!recording) {
        throw new Error('Recording not found');
      }

      // Delete from DB
      await this.prisma.recording.delete({
        where: { id: recording.id },
      });

      // Try to delete file if it exists locally
      // Note: This logic assumes shared storage or local path.
      // TODO: Implementing proper S3 delete logic is tracked in backlog issues #123.
      if (fs.existsSync(recording.filePath)) {
        try {
          fs.unlinkSync(recording.filePath);
        } catch (e) {
          this.logger.warn(
            `Failed to delete file ${recording.filePath}: ${e.message}`,
          );
        }
      }

      return { success: true, message: 'Recording deleted' };
    } catch (error) {
      this.logger.error(`Error deleting recording: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async getDownloadToken(data: { recordId: string }) {
    try {
      const recording = await this.prisma.recording.findUnique({
        where: { recordId: data.recordId },
      });

      if (!recording) {
        throw new Error('Recording not found');
      }

      const secret = this.configService.get('LIVEKIT_API_SECRET');
      if (!secret) {
        throw new Error('Server misconfiguration: LIVEKIT_API_SECRET missing');
      }

      const token = jwt.sign(
        {
          iss: this.configService.get('LIVEKIT_API_KEY'),
          sub: recording.filePath,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour validity
        },
        secret,
        { algorithm: 'HS256' },
      );

      return { success: true, token };
    } catch (error) {
      this.logger.error(`Error generating download token: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async verifyDownloadToken(token: string) {
    try {
      const secret = this.configService.get('LIVEKIT_API_SECRET');
      const decoded = jwt.verify(token, secret) as any;

      if (!decoded || !decoded.sub) {
        throw new Error('Invalid token');
      }

      return { isValid: true, filePath: decoded.sub };
    } catch (error) {
      this.logger.error(`Error verifying token: ${error.message}`);
      throw new RpcException('Invalid or expired token');
    }
  }

  async sendSystemChatMessage(data: { roomId: string; msg: string }) {
    const payloadObj = {
      message: data.msg,
      fromUserId: 'system',
      fromName: 'System',
      type: 'CHAT',
      sentAt: Date.now().toString(),
    };
    const encoder = new TextEncoder();
    const payload = encoder.encode(JSON.stringify(payloadObj));

    await this.liveKitService.getRoomClient().sendData(data.roomId, payload, 1); // 1 = Reliable

    // Push to NATS for Legacy Clients / Backend Listeners
    // Subject: chat (or room-specific if needed)
    // Using "chat" as global subject for now as per ChatService
    // Push to NATS for Legacy Clients / Backend Listeners
    // Subject: roomId:pnm.chat.userId (for system use system id)
    await this.natsService.publishPayload(
      `${data.roomId}:pnm.chat.system`,
      payload,
    );

    return { success: true };
  }

  async getActiveRoomInfo(data: { roomId: string }) {
    const room = await this.prisma.roomInfo.findFirst({
      where: { roomId: data.roomId, isRunning: true },
    });
    if (!room) return { status: false, msg: 'room not found' };

    let participants = 0;
    try {
      const pList = await this.liveKitService
        .getRoomClient()
        .listParticipants(data.roomId);
      participants = pList.length;
    } catch (e) { }

    return {
      status: true,
      msg: 'success',
      room: {
        room_id: room.roomId,
        sid: room.sid,
        room_title: room.roomTitle,
        creation_time: Number(room.creationTime),
        metadata: room.metadata,
        participants,
      },
    };
  }

  async getActiveRoomsInfo() {
    const rooms = await this.prisma.roomInfo.findMany({
      where: { isRunning: true },
    });
    return {
      status: true,
      msg: 'success',
      rooms: rooms.map((r) => ({
        room_id: r.roomId,
        sid: r.sid,
        room_title: r.roomTitle,
        creation_time: Number(r.creationTime),
        metadata: r.metadata,
      })),
    };
  }

  async fetchPastRooms(data: { from?: number; limit?: number }) {
    const { from = 0, limit = 20 } = data;
    const [total, rooms] = await Promise.all([
      this.prisma.roomInfo.count({ where: { isRunning: false } }),
      this.prisma.roomInfo.findMany({
        where: { isRunning: false },
        skip: from,
        take: limit,
        orderBy: { creationTime: 'desc' },
      }),
    ]);
    return {
      status: true,
      msg: 'success',
      result: {
        total_rooms: total,
        rooms: rooms.map((r) => ({
          room_id: r.roomId,
          sid: r.sid,
          room_title: r.roomTitle,
          creation_time: Number(r.creationTime),
          metadata: r.metadata,
        })),
      },
    };
  }

  async changeVisibility(data: { roomId: string; visible: boolean }) {
    const rooms = await this.liveKitService
      .getRoomClient()
      .listRooms([data.roomId]);
    if (rooms.length === 0) return { status: false, msg: 'room not found' };

    const meta: any = JSON.parse(rooms[0].metadata || '{}');
    if (!meta.room_features) meta.room_features = {};
    meta.room_features.is_public = data.visible;

    await this.liveKitService
      .getRoomClient()
      .updateRoomMetadata(data.roomId, JSON.stringify(meta));
    return { status: true, msg: 'success' };
  }

  async updateUserLockSettings(data: {
    roomId: string;
    userId: string;
    service: string;
    lock: boolean;
  }) {
    if (data.userId === 'all') {
      const rooms = await this.liveKitService
        .getRoomClient()
        .listRooms([data.roomId]);
      if (rooms.length === 0) throw new RpcException('room not found');
      const meta: any = JSON.parse(rooms[0].metadata || '{}');
      if (!meta.default_lock_settings) meta.default_lock_settings = {};
      meta.default_lock_settings[data.service] = data.lock;
      await this.liveKitService
        .getRoomClient()
        .updateRoomMetadata(data.roomId, JSON.stringify(meta));
    } else {
      const p = await this.liveKitService
        .getRoomClient()
        .getParticipant(data.roomId, data.userId);
      const meta: any = JSON.parse(p.metadata || '{}');
      if (!meta.lock_settings) meta.lock_settings = {};
      meta.lock_settings[data.service] = data.lock;
      await this.liveKitService
        .getRoomClient()
        .updateParticipant(data.roomId, data.userId, JSON.stringify(meta));
    }
    return { status: true, msg: 'success' };
  }

  async muteUnmuteTrack(data: {
    roomId: string;
    userId: string;
    trackSid?: string;
    muted: boolean;
  }) {
    if (data.userId === 'all') {
      const pList = await this.liveKitService
        .getRoomClient()
        .listParticipants(data.roomId);
      for (const p of pList) {
        const micTrack = p.tracks.find((t) => t.source === 2);
        if (micTrack) {
          await this.liveKitService
            .getRoomClient()
            .mutePublishedTrack(data.roomId, p.identity, micTrack.sid, data.muted);
        }
      }
    } else {
      let trackSid = data.trackSid;
      if (!trackSid) {
        const p = await this.liveKitService
          .getRoomClient()
          .getParticipant(data.roomId, data.userId);
        const micTrack = p.tracks.find((t) => t.source === 2);
        if (micTrack) trackSid = micTrack.sid;
      }
      if (trackSid) {
        await this.liveKitService
          .getRoomClient()
          .mutePublishedTrack(data.roomId, data.userId, trackSid, data.muted);
      }
    }
    return { status: true, msg: 'success' };
  }

  async removeParticipant(data: { roomId: string; userId: string }) {
    await this.liveKitService
      .getRoomClient()
      .removeParticipant(data.roomId, data.userId);
    return { status: true, msg: 'success' };
  }

  async switchPresenter(data: {
    roomId: string;
    userId: string;
    presenter: boolean;
  }) {
    const p = await this.liveKitService
      .getRoomClient()
      .getParticipant(data.roomId, data.userId);
    const meta: any = JSON.parse(p.metadata || '{}');
    meta.is_presenter = data.presenter;
    await this.liveKitService
      .getRoomClient()
      .updateParticipant(data.roomId, data.userId, JSON.stringify(meta));

    await this.liveKitService.getRoomClient().updateParticipant(
      data.roomId,
      data.userId,
      undefined,
      {
        canPublish: data.presenter,
        canSubscribe: true,
        canPublishData: true,
      } as any,
    );

    return { status: true, msg: 'success' };
  }

  // --- Polls Module (Redis) ---

  async activatePolls(data: { roomId: string; active: boolean }) {
    const rooms = await this.liveKitService
      .getRoomClient()
      .listRooms([data.roomId]);
    if (rooms.length === 0) throw new RpcException('room not found');
    const meta: any = JSON.parse(rooms[0].metadata || '{}');
    if (!meta.room_features) meta.room_features = {};
    if (!meta.room_features.polls_features)
      meta.room_features.polls_features = {};
    meta.room_features.polls_features.is_active = data.active;
    await this.updateAndBroadcastRoomMetadata(data.roomId, meta);
    return { status: true, msg: 'success' };
  }

  async countPollTotalResponses(data: { roomId: string; pollId: string }) {
    const responsesMap = await this.redisService.hgetall(
      `polls:${data.pollId}:responses`,
    );
    return {
      status: true,
      msg: 'success',
      total_responses: Object.keys(responsesMap).length,
    };
  }

  async userSelectedOption(data: {
    roomId: string;
    pollId: string;
    userId: string;
  }) {
    const res = await this.redisService.hget(
      `polls:${data.pollId}:responses`,
      data.userId,
    );
    if (!res) return { status: true, msg: 'not voted', voted: false };
    const vote = JSON.parse(res);
    return {
      status: true,
      msg: 'success',
      voted: true,
      selected_option: vote.vote,
    };
  }

  async getPollResponsesDetails(data: { roomId: string; pollId: string }) {
    const responsesMap = await this.redisService.hgetall(
      `polls:${data.pollId}:responses`,
    );
    const responses = Object.values(responsesMap).map((v) => JSON.parse(v));
    return { status: true, msg: 'success', responses };
  }

  async getResponsesResult(data: { roomId: string; pollId: string }) {
    const responsesMap = await this.redisService.hgetall(
      `polls:${data.pollId}:responses`,
    );
    const results: Record<number, number> = {};
    Object.values(responsesMap).forEach((v) => {
      const vote = JSON.parse(v).vote;
      results[vote] = (results[vote] || 0) + 1;
    });
    return { status: true, msg: 'success', result: results };
  }

  async handleRecordingApi(data: any) {
    // Placeholder - real start/stop logic involves EgressClient
    this.logger.log(`Recording API Action: ${data.action} for ${data.room_id}`);
    return { status: true, msg: 'success' };
  }

  async getRecordingInfo(data: any) {
    return { status: true, msg: 'success' };
  }

  async updateRecordingMetadata(data: any) {
    return { status: true, msg: 'success' };
  }

  async handleRtmpApi(data: any) {
    this.logger.log(`RTMP API Action for ${data.room_id}`);
    return { status: true, msg: 'success' };
  }

  async handleRecorderEvents(data: any) {
    this.logger.log(`Recorder Event for ${data.room_id}`);
    return { status: true, msg: 'success' };
  }

  async convertWhiteboardFile(data: any) {
    this.logger.log(`Convert Whiteboard File for ${data.room_id}`);
    return { status: true, msg: 'success' };
  }

  async handleExMedia(data: { roomId: string; action: string; url?: string }) {
    const rooms = await this.liveKitService
      .getRoomClient()
      .listRooms([data.roomId]);
    if (rooms.length === 0) throw new RpcException('room not found');

    const meta: any = JSON.parse(rooms[0].metadata || '{}');
    if (!meta.room_features) meta.room_features = {};
    if (!meta.room_features.external_media_player_features)
      meta.room_features.external_media_player_features = {};

    if (data.action === 'start') {
      meta.room_features.external_media_player_features.is_active = true;
      meta.room_features.external_media_player_features.url = data.url;
    } else {
      meta.room_features.external_media_player_features.is_active = false;
    }

    await this.updateAndBroadcastRoomMetadata(data.roomId, meta);
    return { status: true, msg: 'success' };
  }

  async handleExDisplay(data: {
    roomId: string;
    action: string;
    url?: string;
  }) {
    const rooms = await this.liveKitService
      .getRoomClient()
      .listRooms([data.roomId]);
    if (rooms.length === 0) throw new RpcException('room not found');

    const meta: any = JSON.parse(rooms[0].metadata || '{}');
    if (!meta.room_features) meta.room_features = {};
    if (!meta.room_features.display_external_link_features)
      meta.room_features.display_external_link_features = {};

    if (data.action === 'start') {
      meta.room_features.display_external_link_features.is_active = true;
      meta.room_features.display_external_link_features.url = data.url;
    } else {
      meta.room_features.display_external_link_features.is_active = false;
    }

    await this.updateAndBroadcastRoomMetadata(data.roomId, meta);
    return { status: true, msg: 'success' };
  }

  async getClientFiles(data: any) {
    return {
      status: true,
      msg: 'success',
      css: [],
      js: [],
      css_files: [],
      js_files: [],
    };
  }

  async getRoomFilesByType(data: { roomId: string; fileType: string }) {
    const files = await this.prisma.roomFile.findMany({
      where: { roomId: data.roomId, fileType: data.fileType },
    });
    return { status: true, msg: 'success', files };
  }

  async updateAndBroadcastRoomMetadata(roomId: string, meta: any) {
    const metaStr = JSON.stringify(meta);
    await this.liveKitService.getRoomClient().updateRoomMetadata(roomId, metaStr);
    await this.broadcastNatsEvent(
      NatsMsgServerToClientEvents.ROOM_METADATA_UPDATE,
      roomId,
      metaStr,
    );
  }

  async createPoll(data: {
    roomId: string;
    userId: string;
    pollId?: string;
    question: string;
    options: any[];
  }) {
    try {
      const pollId = data.pollId || uuidv4();
      const pollInfo = {
        id: pollId,
        roomId: data.roomId,
        question: data.question,
        options: data.options,
        isRunning: true,
        createdBy: data.userId,
        created: Math.floor(Date.now() / 1000),
      };

      // Store in Redis: rooms:<roomId>:polls -> field: pollId -> value: JSON
      await this.redisService.hset(
        `rooms:${data.roomId}:polls`,
        pollId,
        JSON.stringify(pollInfo),
      );

      // Broadcast POLL_CREATED
      await this.broadcastNatsEvent(
        NatsMsgServerToClientEvents.POLL_CREATED,
        data.roomId,
        pollId, // client expects pollId string
      );

      return { success: true, pollId, message: 'Poll created' };
    } catch (error) {
      this.logger.error(`Error creating poll: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async listPolls(data: { roomId: string }) {
    try {
      const pollsMap = await this.redisService.hgetall(
        `rooms:${data.roomId}:polls`,
      );
      const polls = Object.values(pollsMap).map((p) => JSON.parse(p));
      // Sort by created desc
      polls.sort((a, b) => b.created - a.created);
      return { success: true, polls };
    } catch (error) {
      this.logger.error(`Error listing polls: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async closePoll(data: { roomId: string; pollId: string; userId: string }) {
    try {
      const key = `rooms:${data.roomId}:polls`;
      const pollJson = await this.redisService.hget(key, data.pollId);

      if (!pollJson) {
        throw new Error('Poll not found');
      }

      const poll = JSON.parse(pollJson);
      poll.isRunning = false;

      await this.redisService.hset(key, data.pollId, JSON.stringify(poll));

      // Broadcast POLL_CLOSED
      await this.broadcastNatsEvent(
        NatsMsgServerToClientEvents.POLL_CLOSED,
        data.roomId,
        data.pollId,
      );

      return { success: true, message: 'Poll closed' };
    } catch (error) {
      this.logger.error(`Error closing poll: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async submitPollResponse(data: {
    roomId: string;
    pollId: string;
    userId: string;
    name: string;
    selectedOption: number;
  }) {
    try {
      // Check if poll exists and is running
      const pollJson = await this.redisService.hget(
        `rooms:${data.roomId}:polls`,
        data.pollId,
      );
      if (!pollJson) {
        throw new Error('Poll not found');
      }
      const poll = JSON.parse(pollJson);
      if (!poll.isRunning) {
        throw new Error('Poll is closed');
      }

      // Store response: polls:<pollId>:responses -> field: userId -> value: JSON
      const response = {
        userId: data.userId,
        name: data.name,
        vote: data.selectedOption,
      };

      await this.redisService.hset(
        `polls:${data.pollId}:responses`,
        data.userId,
        JSON.stringify(response),
      );

      return { success: true, message: 'Vote submitted' };
    } catch (error) {
      this.logger.error(`Error submitting vote: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async getPollStats(data: { roomId: string; pollId: string }) {
    try {
      const responsesMap = await this.redisService.hgetall(
        `polls:${data.pollId}:responses`,
      );
      const responses = Object.values(responsesMap).map((r) => JSON.parse(r));

      return { success: true, responses };
    } catch (error) {
      this.logger.error(`Error getting poll stats: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  // --- File Module ---

  async saveFileMetadata(data: {
    fileId: string;
    roomId: string;
    userId: string;
    filePath: string;
    fileType: string;
    mimeType: string;
    fileSize?: number;
  }) {
    try {
      // DB Client should be generated by now
      await this.prisma.roomFile.create({
        data: {
          fileId: data.fileId,
          roomId: data.roomId,
          userId: data.userId,
          filePath: data.filePath,
          fileType: data.fileType,
          mimeType: data.mimeType,
          fileSize: data.fileSize || 0,
        },
      });
      return { success: true };
    } catch (error) {
      this.logger.error(`Error saving file metadata: ${error.message}`);
      throw new RpcException(error.message);
    }
  }
  // --- Ingress Module ---

  async createIngress(data: CreateIngressReq) {
    try {
      this.logger.log(`Creating ingress for room: ${data.roomId}`);

      // Check if ingress is allowed (via DB metadata or default policy)
      const room = await this.prisma.roomInfo.findFirst({
        where: { roomId: data.roomId, isRunning: true },
      });
      if (!room) throw new Error('Room not found or not active');

      const ingress = await this.liveKitService
        .getIngressClient()
        .createIngress(data.inputType as any, {
          name: `${data.roomId}:${Date.now()}`,
          roomName: data.roomId,
          participantIdentity: `ingress-${Date.now()}`,
          participantName: data.participantName,
        });

      return {
        success: true,
        url: ingress.url,
        streamKey: ingress.streamKey,
      };
    } catch (error) {
      this.logger.error(`Error creating ingress: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  // --- Waiting Room Module ---

  async approveWaitingUsers(data: ApproveWaitingUsersReq) {
    try {
      this.logger.log(
        `Approving waiting users in room: ${data.roomId}, user: ${data.userId}`,
      );

      const participants = await this.liveKitService
        .getRoomClient()
        .listParticipants(data.roomId);

      for (const p of participants) {
        if (data.userId === 'all' || p.identity === data.userId) {
          // Update participant metadata to remove "waitForApproval" flag
          // We assume metadata is JSON.
          let meta: any = {};
          try {
            meta = JSON.parse(p.metadata);
          } catch (e) { }

          if (meta.waitForApproval) {
            meta.waitForApproval = false;
            await this.liveKitService
              .getRoomClient()
              .updateParticipant(data.roomId, p.identity, JSON.stringify(meta));

            // Notify user (system message)
            await this.sendSystemChatMessage({
              roomId: data.roomId,
              msg: `User ${p.name} approved.`,
            });
          }
        }
      }
      return { success: true };
    } catch (error) {
      this.logger.error(`Error approving users: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  async updateWaitingRoomMessage(data: UpdateWaitingRoomMessageReq) {
    try {
      // This is typically stored in Room Metadata
      // Fetch current room metadata
      const room = await this.liveKitService
        .getRoomClient()
        .listRooms([data.roomId]);
      if (room.length === 0) throw new Error('Room not found');

      const currentMetaStr = room[0].metadata;
      let currentMeta: any = {};
      try {
        currentMeta = JSON.parse(currentMetaStr);
      } catch (e) { }

      // Update waiting message
      if (!currentMeta.roomFeatures) currentMeta.roomFeatures = {};
      if (!currentMeta.roomFeatures.waitingRoomFeatures)
        currentMeta.roomFeatures.waitingRoomFeatures = {};
      currentMeta.roomFeatures.waitingRoomFeatures.waitingRoomMsg = data.msg;

      // Save back to LiveKit
      await this.liveKitService
        .getRoomClient()
        .updateRoomMetadata(data.roomId, JSON.stringify(currentMeta));

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error updating waiting room message: ${error.message}`,
      );
      throw new RpcException(error.message);
    }
  }

  async broadcastNatsEvent(
    event: NatsMsgServerToClientEvents,
    roomId: string,
    msg: string,
    toUserId?: string,
  ) {
    const payload = NatsMsgServerToClient.fromPartial({
      event: event,
      msg: msg,
      id: uuidv4(),
    });
    const binary = NatsMsgServerToClient.encode(payload).finish();

    let subject = `${roomId}:pnm.system.public.system`;
    if (toUserId) {
      subject = `${roomId}:pnm.system.private.${toUserId}.system`;
    }

    await this.natsService.publishPayload(subject, binary);
  }

  private async createNatsConsumers(roomId: string, userId: string) {
    await this.natsService.createChatConsumer(roomId, userId);
    await this.natsService.createSystemPublicConsumer(roomId, userId);
    await this.natsService.createSystemPrivateConsumer(roomId, userId);
    await this.natsService.createWhiteboardConsumer(roomId, userId);
    await this.natsService.createDataChannelConsumer(roomId, userId);
  }
  // --- Webhook Sender ---
  private async sendRoomCreatedWebhook(
    info: any,
    emptyTimeout?: number,
    maxParticipants?: number,
  ) {
    if (!info.webhookUrl) return;

    const event = {
      event: 'room_created',
      room: {
        room_id: info.roomId,
        sid: info.sid,
        creation_time: info.creationTime,
        metadata: info.metadata,
        empty_timeout: emptyTimeout,
        max_participants: maxParticipants,
      },
      check_status: false, // Simple field often used in PlugNmeet
    };

    try {
      // Use axios to send
      const axios = require('axios'); // Dynamic import or top-level if preferred
      await axios.post(info.webhookUrl, event, {
        headers: { 'Content-Type': 'application/json' },
      });
      this.logger.log(`Sent room_created webhook to ${info.webhookUrl}`);
    } catch (e) {
      this.logger.error(`Failed to send room_created webhook: ${e.message}`);
    }
  }
}
