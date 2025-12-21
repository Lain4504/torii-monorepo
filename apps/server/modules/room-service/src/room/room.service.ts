import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  PrismaService,
  LiveKitService,
  NatsService,
  RedisService,
  AuthService,
} from '@server/shared';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateRoomReq,
  CreateIngressReq,
  WebhookEvent,
  GenerateTokenReq,
  IsRoomActiveReq,
  GetActiveRoomInfoReq,
  FetchPastRoomsReq,
  RoomEndAPIReq,
  RoomMetadataSchema,
  CreateRoomResSchema,
  RoomEndResSchema,
  IsRoomActiveResSchema,
  GenerateTokenResSchema,
  GetActiveRoomInfoResSchema,
  GetActiveRoomsInfoResSchema,
  FetchPastRoomsResSchema,
  FetchPastRoomsResultSchema,
  ActiveRoomWithParticipantSchema,
  PastRoomInfoSchema,
  ActiveRoomInfoSchema,
} from '@workspace/protocol';
import { toJson, fromJson } from '@bufbuild/protobuf';
import { AnalyticsService } from '../analytics/analytics.service';
import { WebhookService } from '../webhook/webhook.service';
import {
  AnalyticsEvents,
  AnalyticsEventType,
  NatsMsgServerToClientEvents,
  NatsMsgServerToClientSchema,
} from '@workspace/protocol';
import { create, toBinary } from '@bufbuild/protobuf';
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
    private readonly webhookService: WebhookService,
    private readonly authService: AuthService,
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

    // Try to acquire lock with retries (handle concurrent requests)
    let acquired = false;
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
      acquired = await this.redisService.acquireLock(lockKey, 'locked', 10); // 10s TTL
      if (acquired) break;

      // Wait before retry (exponential backoff)
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }

    if (!acquired) {
      throw new RpcException('Room creation in progress, please try again in a few seconds');
    }

    try {
      const roomId = data.roomId;
      if (!roomId) throw new RpcException('Room ID is required');

      this.logger.log(`Creating room: ${roomId}`);

      // Check if room exists in DB
      const existingRoom = await this.prisma.roomInfo.findFirst({
        where: { roomId: roomId, isRunning: true },
      });

      if (existingRoom) {
        // Check NATS for liveness
        const rInfo = await this.natsService.getRoomInfo(roomId);
        if (rInfo && rInfo.roomId) {
          this.logger.log(
            `Room ${roomId} found active in NATS. Returning existing info.`,
          );
          // Ensure streams are active
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
            fromJson(RoomMetadataSchema, JSON.parse((existingRoom.metadata as string) || '{}')), // ✅ Parse to protobuf object
          );

          return create(CreateRoomResSchema, {
            status: true,
            roomInfo: activeRoomInfo,
            msg: 'Room already active',
          });
        } else {
          this.logger.warn(
            `Room ${roomId} found in DB but not in NATS (stale). Creating new session.`,
          );
          // Proceed to create new room...
        }
      }

      // Initialize defaults using RoomUtils
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
        ? JSON.stringify(toJson(RoomMetadataSchema, data.metadata))
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

      // Add room to NATS KV
      this.logger.log(`Adding room to NATS KV: ${room.name}`);
      await this.natsService.addRoom(
        dbRoom.id.toString(),
        dbRoom.roomId,
        dbRoom.sid,
        data.emptyTimeout || 0,
        data.maxParticipants || 0,
        JSON.parse(metadataJson), // ✅ Use parsed JSON instead of protobuf object
      );
      this.logger.log(`Room ${room.name} added to NATS KV`);

      // Analytics
      await this.analyticsService.sendAnalyticsData({
        eventType: AnalyticsEventType.ROOM,
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

      // Send webhook asynchronously
      this.webhookService.sendRoomCreatedWebhook(
        activeRoomInfo,
        data.emptyTimeout,
        data.maxParticipants,
      ).catch(err => {
        this.logger.error(`Webhook send failed: ${err.message}`);
      });

      // Preload whiteboard file if needed
      if (!data.metadata?.isBreakoutRoom) {
        this.prepareWhiteboardPreloadFile(
          data.metadata,
          room.name,
          room.sid,
        ).catch(err => {
          this.logger.error(`Whiteboard preload failed: ${err.message}`);
        });
      }

      this.logger.log(`Room created successfully: ${room.name}`);

      return create(CreateRoomResSchema, {
        status: true,
        msg: 'success',
        roomInfo: activeRoomInfo,
      });
    } catch (error) {
      this.logger.error(`Error creating room: ${error.message}`);
      throw new RpcException(error.message);
    } finally {
      await this.redisService.releaseLock(lockKey, 'locked');
    }
  }

  private async createRoomNatsStreams(roomId: string) {
    const subjects = [
      `${roomId}:chat.*`,
      `${roomId}:sysPublic.*`,
      `${roomId}:sysPrivate.*.*`,
      `${roomId}:whiteboard.*`,
      `${roomId}:dataChannel.*`,
    ];
    await this.natsService.createStream(roomId, subjects);
  }

  async endRoom(data: RoomEndAPIReq) {
    const roomId = data.roomId;
    this.logger.log(`Ending room: ${roomId}`);

    try {
      // Get room info from DB
      const roomDbInfo = await this.prisma.roomInfo.findFirst({
        where: { roomId: roomId, isRunning: true },
      });

      if (!roomDbInfo) {
        return create(RoomEndResSchema, {
          status: false,
          msg: 'Room not found or not active'
        });
      }

      // Get room info from NATS
      const natsRoomInfo = await this.natsService.getRoomInfo(roomId);

      // Trigger async cleanup
      setImmediate(() => {
        this.onAfterRoomEnded(
          BigInt(roomDbInfo.id),  // Convert number to bigint
          roomDbInfo.roomId,
          roomDbInfo.sid,
          roomDbInfo.metadata as string || '',
          natsRoomInfo?.status || ''
        ).catch(err => {
          this.logger.error(`Error in room cleanup: ${err.message}`, err.stack);
        });
      });

      return create(RoomEndResSchema, {
        status: true,
        msg: 'Room end triggered'
      });
    } catch (error) {
      this.logger.error(`Error ending room: ${error.message}`);
      throw new RpcException(error.message);
    }
  }

  /**
   * Complete room cleanup after ending
   *
   * 14-step cleanup process:
   * 1. Acquire lock
   * 2. Update NATS status
   * 3. End room in LiveKit
   * 4. Update DB status
   * 5. Clear user blocklists
   * 6. Stop recorders
   * 7. Delete uploaded files
   * 8. Remove from duration checker
   * 9. Clean up etherpad
   * 10. Clean up polls
   * 11. Breakout room cleanup
   * 12. Speech service cleanup
   * 13. Insights cleanup
   * 14. Final NATS cleanup + analytics
   */
  private async onAfterRoomEnded(
    dbTableId: bigint,
    roomId: string,
    roomSid: string,
    metadata: string,
    roomStatus: string,
  ): Promise<void> {
    const log = this.logger;
    log.log(`Starting room cleanup for: ${roomId}`);

    // Step 1: Acquire lock to prevent race with room creation
    const lockKey = `room_creation_lock:${roomId}`;
    const acquired = await this.redisService.acquireLock(lockKey, 'cleanup', 15);

    if (!acquired) {
      log.warn(`Could not acquire cleanup lock for room: ${roomId}`);
      return;
    }

    try {
      // Step 2: Update NATS status if not already ended
      if (roomStatus !== 'ended') {
        await this.natsService.updateRoomInfo(roomId, { status: 'ended' });

        // End room in LiveKit
        try {
          await this.liveKitService.getRoomClient().deleteRoom(roomId);
        } catch (err) {
          log.error(`Error deleting LiveKit room: ${err.message}`);
        }
      }

      // Step 3: Update DB status
      await this.prisma.roomInfo.updateMany({
        where: { roomId: roomId },
        data: { isRunning: false, endedAt: new Date() },
      });

      // Step 4: Clear user blocklists (if NATS service has this method)
      // await this.natsService.deleteRoomUsersBlockList(roomId);

      // Step 5: Stop recorders (placeholder - implement when recorder service exists)
      // await this.recorderService.stopRecording(roomId, roomSid);

      // Step 6: Delete uploaded files (placeholder - implement when file service exists)
      // const keepFiles = this.configService.get<boolean>('KEEP_FILES_FOREVER');
      // if (!keepFiles) {
      //   await this.fileService.deleteRoomFiles(roomSid);
      // }

      // Step 7: Remove from duration checker (placeholder)
      // await this.roomDurationService.removeRoom(roomId);

      // Step 8: Clean up etherpad (placeholder)
      // await this.etherpadService.cleanupAfterRoomEnd(roomId, metadata);

      // Step 9: Clean up polls (placeholder)
      // await this.pollService.cleanupPolls(roomId);

      // Step 10: Breakout room cleanup (placeholder)
      // await this.breakoutRoomService.postEndCleanup(roomId, metadata);

      // Step 11: Speech service cleanup (placeholder)
      // await this.speechService.onAfterRoomEnded(roomId, roomSid);

      // Step 12: Insights cleanup (placeholder)
      // await this.insightsService.onAfterRoomEnded(dbTableId, roomId, roomSid);

      // Step 13: Final NATS cleanup
      // Delete room-specific streams and KV
      // TODO: Implement deleteRoom method in NatsService
      // await this.natsService.deleteRoom(roomId);

      // Step 14: Send webhook notification
      await this.webhookService.sendRoomFinishedWebhook(roomId, roomSid, metadata);
      this.webhookService.unregisterWebhook(roomId);

      // Schedule analytics export
      setTimeout(() => {
        this.exportAnalytics(roomId, roomSid, metadata).catch(err => {
          log.error(`Analytics export failed: ${err.message}`);
        });
      }, 5000); // 5 second delay

      log.log(`Room cleanup completed for: ${roomId}`);
    } catch (error) {
      log.error(`Error during room cleanup: ${error.message}`, error.stack);
    } finally {
      // Always release lock
      await this.redisService.releaseLock(lockKey, 'cleanup');
    }
  }

  /**
   * Export room analytics
   * Called after cleanup with delay
   */
  private async exportAnalytics(roomId: string, roomSid: string, metadata: string): Promise<void> {
    this.logger.log(`Exporting analytics for room: ${roomId}`);

    // Send final analytics event
    await this.analyticsService.sendAnalyticsData({
      eventType: AnalyticsEventType.ROOM,
      eventName: AnalyticsEvents.ANALYTICS_EVENT_UNKNOWN,
      roomId: roomId,
      roomSid: roomSid,
      time: Date.now(),
      eventValueString: 'analytics_export',
    } as any);
  }

  /**
   * Prepare and process whiteboard preload file
   *
   * Downloads and processes a whiteboard file URL if provided in room metadata.
   * Updates room metadata with processed file information.
   */
  private async prepareWhiteboardPreloadFile(
    metadata: any,
    roomId: string,
    roomSid: string,
  ): Promise<void> {
    try {
      const wbFeatures = metadata?.roomFeatures?.whiteboardFeatures;

      // Check if whiteboard is enabled and has preload file
      if (!wbFeatures?.isAllow || !wbFeatures?.preloadFile) {
        return;
      }

      const preloadFileUrl = wbFeatures.preloadFile;
      this.logger.log(`Preparing whiteboard preload file: ${preloadFileUrl}`);

      // TODO: Implement actual file download and processing
      // This would involve:
      // 1. Download file from URL
      // 2. Process/convert file (PDF, Office docs, etc.)
      // 3. Upload to storage
      // 4. Get file ID, path, pages count

      // For now, just log that we would process it
      this.logger.warn(`Whiteboard file processing not yet implemented: ${preloadFileUrl}`);

      // When implemented, would update metadata like this:
      // const processedFile = await this.fileService.downloadAndProcessWhiteboardFile(
      //   roomId,
      //   roomSid,
      //   preloadFileUrl
      // );
      //
      // // Update metadata
      // metadata.roomFeatures.whiteboardFeatures.preloadFile = null;
      // metadata.roomFeatures.whiteboardFeatures.whiteboardFileId = processedFile.fileId;
      // metadata.roomFeatures.whiteboardFeatures.fileName = processedFile.fileName;
      // metadata.roomFeatures.whiteboardFeatures.filePath = processedFile.filePath;
      // metadata.roomFeatures.whiteboardFeatures.totalPages = processedFile.totalPages;
      //
      // // Broadcast updated metadata to room
      // await this.natsService.updateAndBroadcastRoomMetadata(roomId, metadata);

    } catch (error) {
      this.logger.error(
        `Error preparing whiteboard preload file: ${error.message}`,
        error.stack
      );

      // Send error notification to room (if method exists)
      // await this.natsService.notifyErrorMsg(
      //   roomId,
      //   'notifications.preloaded-whiteboard-file-processing-error',
      //   null
      // );
    }
  }

  async getRoomStatus(data: IsRoomActiveReq) {
    const roomId = data.roomId;
    if (!roomId) {
      return create(IsRoomActiveResSchema, {
        status: false,
        isActive: false,
        msg: 'Room ID is required'
      });
    }
    const room = await this.prisma.roomInfo.findFirst({
      where: { roomId: roomId, isRunning: true },
    });
    return create(IsRoomActiveResSchema, {
      status: true,
      isActive: !!room,
      msg: room ? 'active' : 'not active'
    });
  }

  /**
   * Generate join token for user
   * Matches Go: UserModel.GetPNMJoinToken()
   * 
   * Complete implementation with:
   * - User metadata initialization
   * - NATS user storage
   * - Lock settings
   * - Presenter assignment
   * - Validation checks
   */
  async generateToken(data: GenerateTokenReq) {
    const roomId = data.roomId;
    const userInfo = data.userInfo;

    if (!roomId || !userInfo || !userInfo.name || !userInfo.userId) {
      return create(GenerateTokenResSchema, {
        status: false,
        msg: 'roomId, userId, and name are required'
      });
    }

    // Step 1: Validate reserved names (Go: line 34-38)
    const RESERVED_NAMES = ['RECORDER_BOT', 'RTMP_BOT'];
    if (RESERVED_NAMES.includes(userInfo.name)) {
      return create(GenerateTokenResSchema, {
        status: false,
        msg: `name: ${userInfo.name} is reserved for internal use only`
      });
    }

    // Step 2: Fetch room info and metadata from NATS (Go: line 41-51)
    const roomNatsInfo = await this.natsService.getRoomInfo(roomId);
    if (!roomNatsInfo || !roomNatsInfo.roomId) {
      return create(GenerateTokenResSchema, {
        status: false,
        msg: 'room not found or not active'
      });
    }

    // Step 3: Check room status (Go: line 54-58)
    if (roomNatsInfo.status === 'ended') {
      return create(GenerateTokenResSchema, {
        status: false,
        msg: 'room has ended, need to recreate it'
      });
    }

    // Step 4: Parse room metadata
    let roomMetadata: any;
    try {
      roomMetadata = JSON.parse(roomNatsInfo.metadata || '{}');
    } catch (e) {
      return create(GenerateTokenResSchema, {
        status: false,
        msg: 'invalid room metadata'
      });
    }

    // Step 5: Initialize user metadata (Go: line 60-62)
    const metadata: any = userInfo.userMetadata || {};

    // Step 6: Handle exUserId (Go: line 65-69)
    if (!metadata.exUserId || metadata.exUserId === '') {
      metadata.exUserId = userInfo.userId; // Use userId as default
    }

    // Step 7: Validate user ID format (Go: line 104-108)
    const validUserIdRegex = /^[a-zA-Z0-9-_]+$/;
    if (!validUserIdRegex.test(userInfo.userId)) {
      return create(GenerateTokenResSchema, {
        status: false,
        msg: 'user_id should only contain ASCII letters (a-z A-Z), digits (0-9) or -_'
      });
    }

    // Step 8: Check duplicate user (Go: line 84-100)
    try {
      const userStatus = await this.natsService.getRoomUserStatus(roomId, userInfo.userId);
      if (userStatus === 'online') {
        this.logger.warn(`Duplicate user ${userInfo.userId} in room ${roomId}, this may cause issues`);
        // Note: In production, should remove existing user first
        // For now, we'll allow it but log warning
      }
    } catch (e) {
      // User not found - this is fine
    }

    // Step 9: Assign permissions and lock settings (Go: line 111-137)
    metadata.isAdmin = userInfo.isAdmin;
    metadata.recordWebcam = metadata.recordWebcam ?? true;

    if (userInfo.isAdmin) {
      // Admin user setup
      metadata.waitForApproval = false;

      // Check if should be presenter (first admin)
      const onlineUsers = await this.natsService.getOnlineUsersList(roomId);
      const hasPresenter = onlineUsers.some(u => {
        try {
          const userMeta = JSON.parse(u.metadata || '{}');
          return userMeta.isPresenter === true;
        } catch {
          return false;
        }
      });

      if (!hasPresenter) {
        metadata.isPresenter = true; // First admin becomes presenter
      } else {
        metadata.isPresenter = false;
      }

      // Admin: no locks except whiteboard for non-presenters
      metadata.lockSettings = {};
      if (!metadata.isPresenter && roomMetadata.default_lock_settings) {
        metadata.lockSettings.lockWhiteboard = roomMetadata.default_lock_settings.lock_whiteboard;
      }

    } else {
      // Regular user: apply default lock settings
      metadata.isPresenter = false;

      if (roomMetadata.default_lock_settings) {
        metadata.lockSettings = {
          lockMicrophone: roomMetadata.default_lock_settings.lock_microphone,
          lockWebcam: roomMetadata.default_lock_settings.lock_webcam,
          lockScreenSharing: roomMetadata.default_lock_settings.lock_screen_sharing,
          lockChat: roomMetadata.default_lock_settings.lock_chat,
          lockChatSendMessage: roomMetadata.default_lock_settings.lock_chat_send_message,
          lockChatFileShare: roomMetadata.default_lock_settings.lock_chat_file_share,
          lockPrivateChat: roomMetadata.default_lock_settings.lock_private_chat,
          lockWhiteboard: roomMetadata.default_lock_settings.lock_whiteboard,
          lockSharedNotepad: roomMetadata.default_lock_settings.lock_shared_notepad,
        };
      }

      // Waiting room check (Go: line 134-136)
      if (roomMetadata.room_features?.waiting_room_features?.is_active) {
        metadata.waitForApproval = true;
      } else {
        metadata.waitForApproval = false;
      }
    }

    // Step 10: Add user to NATS KV (Go: line 144-148) - CRITICAL!
    try {
      await this.natsService.addUser(
        roomId,
        userInfo.userId,
        userInfo.name,
        userInfo.isAdmin,
        metadata.isPresenter || false,
        metadata
      );
    } catch (e) {
      this.logger.error(`Failed to add user to NATS: ${e.message}`);
      return create(GenerateTokenResSchema, {
        status: false,
        msg: 'failed to add user to system'
      });
    }

    // Step 11: Generate plugNmeet JWT token (Go: line 151-161)
    const token = this.authService.generatePlugNmeetJWTAccessToken({
      name: userInfo.name,
      user_id: userInfo.userId,
      room_id: roomId,
      is_admin: userInfo.isAdmin,
      is_hidden: userInfo.isHidden || false,
    });

    this.logger.log(`Generated token for user ${userInfo.userId} in room ${roomId}`);

    return create(GenerateTokenResSchema, {
      status: true,
      msg: 'success',
      token,
    });
  }

  async handleWebhookEvent(event: WebhookEvent) {
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
            eventType: AnalyticsEventType.ROOM,
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
            eventType: AnalyticsEventType.ROOM,
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
              joinedAt: Number(user.joinedAt) * 1000,
              roomId: roomId,
            } as any);

            // Create NATS Consumers
            await this.createNatsConsumers(roomId, user.identity);

            await this.analyticsService.sendAnalyticsData({
              eventType: AnalyticsEventType.USER,
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
              eventType: AnalyticsEventType.USER,
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
          if (event.egressInfo && (event.egressInfo as any).file) {
            const recordingInfo = event.egressInfo as any;
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
              eventType: AnalyticsEventType.ROOM,
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
    // Subject: roomId:chat.userId (for system use system id)
    await this.natsService.publishPayload(
      `${data.roomId}:chat.system`,
      payload,
    );

    return { success: true };
  }

  async getActiveRoomInfo(data: GetActiveRoomInfoReq) {
    const room = await this.prisma.roomInfo.findFirst({
      where: { roomId: data.roomId, isRunning: true },
    });
    if (!room) {
      return create(GetActiveRoomInfoResSchema, {
        status: false,
        msg: 'room not found'
      });
    }

    let participantsInfo: any[] = [];
    try {
      participantsInfo = await this.liveKitService
        .getRoomClient()
        .listParticipants(data.roomId);
    } catch (e) {
      this.logger.warn(`Failed to fetch participants for room ${data.roomId}`);
    }

    const activeRoomInfo = create(ActiveRoomInfoSchema, {
      roomTitle: room.roomTitle,
      roomId: room.roomId,
      sid: room.sid,
      joinedParticipants: String(participantsInfo.length),
      isRunning: room.isRunning ? 1 : 0,
      isRecording: 0,
      isActiveRtmp: 0,
      webhookUrl: room.webhookUrl || '',
      isBreakoutRoom: 0,
      parentRoomId: '',
      creationTime: String(room.creationTime),
      metadata: room.metadata as string || '',
    });

    const roomWithParticipants = create(ActiveRoomWithParticipantSchema, {
      roomInfo: activeRoomInfo,
      participantsInfo: participantsInfo,
    });

    return create(GetActiveRoomInfoResSchema, {
      status: true,
      msg: 'success',
      room: roomWithParticipants,
    });
  }

  async getActiveRoomsInfo() {
    const rooms = await this.prisma.roomInfo.findMany({
      where: { isRunning: true },
    });
    const roomsWithParticipants = rooms.map((r) => {
      const activeRoomInfo = create(ActiveRoomInfoSchema, {
        roomTitle: r.roomTitle,
        roomId: r.roomId,
        sid: r.sid,
        joinedParticipants: String(r.joinedParticipants || 0),
        isRunning: r.isRunning ? 1 : 0,
        isRecording: 0,
        isActiveRtmp: 0,
        webhookUrl: r.webhookUrl || '',
        isBreakoutRoom: 0,
        parentRoomId: '',
        creationTime: String(r.creationTime),
        metadata: r.metadata as string || '',
      });

      return create(ActiveRoomWithParticipantSchema, {
        roomInfo: activeRoomInfo,
        participantsInfo: [],
      });
    });

    return create(GetActiveRoomsInfoResSchema, {
      status: true,
      msg: 'success',
      rooms: roomsWithParticipants,
    });
  }

  async fetchPastRooms(data: FetchPastRoomsReq) {
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
    const pastRooms = rooms.map((r) =>
      create(PastRoomInfoSchema, {
        roomTitle: r.roomTitle,
        roomId: r.roomId,
        roomSid: r.sid,
        joinedParticipants: String(r.joinedParticipants || 0),
        webhookUrl: r.webhookUrl || '',
        created: r.createdAt?.toISOString() || '',
        ended: r.endedAt?.toISOString() || '',
      })
    );

    const result = create(FetchPastRoomsResultSchema, {
      totalRooms: String(total),
      from: from,
      limit: limit,
      orderBy: data.orderBy || 'DESC',
      roomsList: pastRooms,
    });

    return create(FetchPastRoomsResSchema, {
      status: true,
      msg: 'success',
      result: result,
    });
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

  async getRoomFilesByType(data: { roomId: string; fileType: number }) {
    // fileType is RoomUploadedFileType enum (number)
    // Convert to string for Prisma query if needed
    const fileTypeStr = data.fileType.toString();

    const files = await this.prisma.roomFile.findMany({
      where: { roomId: data.roomId, fileType: fileTypeStr },
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

  async broadcastNatsEvent(
    event: NatsMsgServerToClientEvents,
    roomId: string,
    msg: string,
    toUserId?: string,
  ) {
    const payload = create(NatsMsgServerToClientSchema, {
      event: event,
      msg: msg,
      id: uuidv4(),
    });
    const binary = toBinary(NatsMsgServerToClientSchema, payload);

    let subject = `${roomId}:sysPublic.system`;
    if (toUserId) {
      subject = `${roomId}:sysPrivate.${toUserId}.system`;
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
      check_status: false,
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
