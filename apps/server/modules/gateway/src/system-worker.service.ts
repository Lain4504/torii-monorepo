import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsService, AuthService } from '@server/shared';
import {
  NatsMsgClientToServer,
  NatsMsgClientToServerEvents,
  NatsMsgServerToClientEvents,
  NatsInitialData,
  MediaServerConnInfo,
  NatsMsgServerToClient,
  NatsMsgClientToServerSchema,
  NatsInitialDataSchema,
  MediaServerConnInfoSchema,
  NatsKvUserInfoSchema,
  NatsUserMetadataUpdateSchema,
} from '@workspace/protocol';
import { create, fromBinary, toJsonString, toJson } from '@bufbuild/protobuf';
import { StringCodec } from 'nats';

@Injectable()
export class SystemWorkerService implements OnModuleInit {
  private readonly logger = new Logger(SystemWorkerService.name);
  private readonly sc = StringCodec();

  constructor(
    private readonly natsService: NatsService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) { }

  async onModuleInit() {
    this.subscribeToSystemWorker().catch((err) =>
      this.logger.error('Failed to subscribe to system worker', err),
    );
  }

  private async subscribeToSystemWorker() {
    // Subject pattern: sysJsWorker.> (matches sysJsWorker.ROOM_ID.USER_ID)
    const subject = 'sysJsWorker.>';
    const queue = 'sysJsWorkerQueue'; // Use a queue group for load balancing

    await this.natsService.subscribe(subject, queue, async (m) => {
      try {
        const data = m.data;
        const sub = m.subject;
        const parts = sub.split('.');
        // sysJsWorker.roomId.userId
        if (parts.length !== 3) {
          return;
        }
        const roomId = parts[1];
        const userId = parts[2];

        const req = fromBinary(NatsMsgClientToServerSchema, data);
        await this.handleClientRequest(roomId, userId, req);
      } catch (e) {
        this.logger.error('Error handling system worker message', e);
      }
    });
    this.logger.log('Subscribed to sysJsWorker.>');
  }

  private async handleClientRequest(
    roomId: string,
    userId: string,
    req: NatsMsgClientToServer,
  ) {
    switch (req.event) {
      case NatsMsgClientToServerEvents.REQ_INITIAL_DATA:
        await this.handleInitialData(roomId, userId);
        break;
      case NatsMsgClientToServerEvents.REQ_MEDIA_SERVER_DATA:
        await this.handleMediaServerData(roomId, userId);
        break;
      case NatsMsgClientToServerEvents.REQ_JOINED_USERS_LIST:
        await this.handleJoinedUsersList(roomId, userId);
        break;
      case NatsMsgClientToServerEvents.REQ_RAISE_HAND:
        await this.handleRaiseHand(roomId, userId, req.msg);
        break;
      case NatsMsgClientToServerEvents.REQ_LOWER_HAND:
        await this.handleLowerHand(roomId, userId);
        break;
      case NatsMsgClientToServerEvents.REQ_LOWER_OTHER_USER_HAND:
        await this.handleLowerOtherUserHand(roomId, req.msg);
        break;
      case NatsMsgClientToServerEvents.REQ_RENEW_PNM_TOKEN:
        await this.handleRenewToken(roomId, userId, req.msg);
        break;
      case NatsMsgClientToServerEvents.PING:
        // PING is just keep-alive, no action needed
        // User join is tracked via $SYS.ACCOUNT connection events
        break;
      default:
        // this.logger.warn(`Unhandled event: ${req.event}`);
        break;
    }
  }

  private async handleInitialData(roomId: string, userId: string) {
    this.logger.debug(
      `Handling REQ_INITIAL_DATA for room: ${roomId}, user: ${userId}`,
    );

    // 1. Get Room Info
    const roomInfo = await this.natsService.getRoomInfo(roomId);
    if (!roomInfo || !roomInfo.roomId) {
      this.logger.error(`Room info not found for ${roomId}`);
      // Send error?
      return;
    }

    // Metadata is already stored in correct JSON format in NATS
    // No conversion needed - just use as-is

    // 2. Get User Info
    const userInfo = await this.natsService.getUserInfo(roomId, userId);
    if (!userInfo || !userInfo.userId) {
      this.logger.error(`User info not found for ${userId} in room ${roomId}`);
      return;
    }

    // 3. (Optional here/Moved) MediaServerInfo is requested separately in REQ_MEDIA_SERVER_DATA
    // Keeping it undefined here to match client's expectation that it comes later.
    const mediaServerInfo = undefined;

    // 4. Construct Response
    const initialData = create(NatsInitialDataSchema, {
      room: roomInfo,
      localUser: userInfo,
      mediaServerInfo: mediaServerInfo,
    });

    // 5. Send Response
    // Use broadcastSystemEvent with specific event type
    // The client expects the 'msg' field to be a JSON string of the NatsInitialData object.
    await this.natsService.broadcastSystemEvent(
      NatsMsgServerToClientEvents.RES_INITIAL_DATA,
      roomId,
      toJsonString(NatsInitialDataSchema, initialData),
      userId,
    );

    this.logger.debug(`Sent RES_INITIAL_DATA to ${userId}`);
  }

  private async handleMediaServerData(roomId: string, userId: string) {
    this.logger.debug(
      `Handling REQ_MEDIA_SERVER_DATA for ${userId} in ${roomId}`,
    );

    const userInfo = await this.natsService.getUserInfo(roomId, userId);
    const userInfoMsg = create(NatsKvUserInfoSchema, userInfo);
    this.logger.debug(`Fetch UserInfo from NATS: ${toJsonString(NatsKvUserInfoSchema, userInfoMsg)}`);

    if (!userInfo || !userInfo.userId) {
      this.logger.error(`User info not found for ${userId} in room ${roomId}`);
      return;
    }

    const mediaServerInfo = await this.generateMediaServerInfo(
      roomId,
      userId,
      userInfo,
    );
    if (!mediaServerInfo) {
      this.logger.error(`Failed to generate media server info for ${userId}`);
      return;
    }
    this.logger.debug(
      `Generated Token for LiveKit URL: ${mediaServerInfo.url}`,
    );

    await this.natsService.broadcastSystemEvent(
      NatsMsgServerToClientEvents.RES_MEDIA_SERVER_DATA,
      roomId,
      toJsonString(MediaServerConnInfoSchema, mediaServerInfo),
      userId,
    );
    this.logger.debug(`Sent RES_MEDIA_SERVER_DATA to ${userId}`);
  }

  private async handleJoinedUsersList(roomId: string, userId: string) {
    this.logger.debug(
      `Handling REQ_JOINED_USERS_LIST for ${userId} in ${roomId}`,
    );

    try {
      this.logger.debug(`Calling getOnlineUsersList for room ${roomId}...`);
      const usersList = await this.natsService.getOnlineUsersList(roomId);
      this.logger.debug(
        `Got ${usersList?.length || 0} users from getOnlineUsersList`,
      );

      if (usersList && usersList.length > 0) {
        this.logger.debug(
          `User IDs: ${JSON.stringify(usersList.map((u) => u.userId))}`,
        );
      }

      if (!usersList || usersList.length === 0) {
        this.logger.warn(`No online users found in room ${roomId}`);
        return;
      }

      // Convert to JSON array format that client expects
      // We must Convert each user object to a Proto Message then to JSON (which handles BigInt as string)
      const usersListSafe = usersList.map((u) => {
        const msg = create(NatsKvUserInfoSchema, u);
        return toJson(NatsKvUserInfoSchema, msg);
      });
      const usersListJson = JSON.stringify(usersListSafe);

      await this.natsService.broadcastSystemEvent(
        NatsMsgServerToClientEvents.RES_JOINED_USERS_LIST,
        roomId,
        usersListJson,
        userId,
      );
      this.logger.debug(
        `Sent RES_JOINED_USERS_LIST to ${userId} with ${usersList.length} users`,
      );
    } catch (error: any) {
      this.logger.error(`Error handling joined users list: ${error.message}`);
    }
  }

  private async handleRaiseHand(
    roomId: string,
    userId: string,
    reqMsg?: string,
  ) {
    this.logger.log(`User ${userId} raising hand in room ${roomId}`);
    try {
      // Get user metadata
      const userInfo = await this.natsService.getUserInfo(roomId, userId);
      if (!userInfo || !userInfo.metadata) {
        this.logger.warn(`No user metadata found for ${userId}`);
        return;
      }

      // Parse metadata
      const metadata = JSON.parse(userInfo.metadata);
      metadata.raisedHand = true;

      // Update metadata in NATS
      const metadataJson = JSON.stringify(metadata);
      await this.natsService.updateUserKeyValue(
        roomId,
        userId,
        'metadata',
        metadataJson,
      );

      // Broadcast metadata update to all users (matching protobuf schema)
      // Broadcast metadata update to all users (matching protobuf schema)
      const metadataUpdate = create(NatsUserMetadataUpdateSchema, {
        userId: userId,
        metadata: metadataJson,
      });
      await this.natsService.broadcastSystemEvent(
        NatsMsgServerToClientEvents.USER_METADATA_UPDATE,
        roomId,
        toJsonString(NatsUserMetadataUpdateSchema, metadataUpdate),
        undefined, // Send to all users
      );

      // Notify admins with proper message
      const notificationMsg = `${userInfo.name} raised hand`;
      const participants = await this.natsService.getOnlineUsersList(roomId);
      for (const participant of participants) {
        if (participant.isAdmin && userId !== participant.userId) {
          await this.natsService.notifyInfoMsg(
            roomId,
            notificationMsg,
            true,
            participant.userId,
          );
        }
      }

      this.logger.log(`User ${userId} raised hand successfully`);
    } catch (error: any) {
      this.logger.error(`Error handling raise hand: ${error.message}`);
    }
  }

  private async handleLowerHand(roomId: string, userId: string) {
    this.logger.log(`User ${userId} lowering hand in room ${roomId}`);
    try {
      // Get user metadata
      const userInfo = await this.natsService.getUserInfo(roomId, userId);
      if (!userInfo || !userInfo.metadata) {
        return;
      }

      // Parse metadata
      const metadata = JSON.parse(userInfo.metadata);
      metadata.raisedHand = false;

      // Update metadata in NATS
      const metadataJson = JSON.stringify(metadata);
      await this.natsService.updateUserKeyValue(
        roomId,
        userId,
        'metadata',
        metadataJson,
      );

      // Broadcast metadata update to all users (matching protobuf schema)
      // Broadcast metadata update to all users (matching protobuf schema)
      const metadataUpdate = create(NatsUserMetadataUpdateSchema, {
        userId: userId,
        metadata: metadataJson,
      });
      await this.natsService.broadcastSystemEvent(
        NatsMsgServerToClientEvents.USER_METADATA_UPDATE,
        roomId,
        toJsonString(NatsUserMetadataUpdateSchema, metadataUpdate),
        undefined,
      );

      this.logger.log(`User ${userId} lowered hand successfully`);
    } catch (error: any) {
      this.logger.error(`Error handling lower hand: ${error.message}`);
    }
  }

  private async handleLowerOtherUserHand(roomId: string, targetUserId: string) {
    this.logger.log(
      `Admin lowering hand for user ${targetUserId} in room ${roomId}`,
    );
    try {
      // Reuse lowerHand logic
      await this.handleLowerHand(roomId, targetUserId);
    } catch (error: any) {
      this.logger.error(`Error lowering other user hand: ${error.message}`);
    }
  }

  /**
   * Generate LiveKit server connection info
   * Matches Go: NatsModel.GenerateLivekitToken() + HandleMediaServerInfo()
   */
  private async generateMediaServerInfo(
    roomId: string,
    userId: string,
    userInfo: any,
  ): Promise<MediaServerConnInfo | undefined> {
    try {
      // Get LiveKit host URL
      // Go server: strings.Replace(m.app.LivekitInfo.Host, "host.docker.internal", "localhost", 1)
      let livekitHost = this.configService.get<string>(
        'LIVEKIT_API_URL',
        'ws://localhost:7880',
      );

      // Replace docker internal host with localhost (matching Go server)
      livekitHost = livekitHost.replace('host.docker.internal', 'localhost');

      // Generate LiveKit token using AuthService
      // Matches Go: auth.GenerateLivekitAccessToken()
      const token = await this.authService.generateLivekitAccessToken({
        name: userInfo.name,
        user_id: userId,
        room_id: roomId,
        is_admin: userInfo.isAdmin,
        is_hidden: userInfo.isHidden || false,
      });

      return create(MediaServerConnInfoSchema, {
        url: livekitHost,
        token: token,
        enabledE2ee: false,
      });
    } catch (error: any) {
      this.logger.error(`Failed to generate media server info: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Handle token renewal request
   * Matches Go: NatsModel.RenewPNMToken()
   */
  private async handleRenewToken(roomId: string, userId: string, oldToken?: string) {
    this.logger.log(`Renewing token for user ${userId} in room ${roomId}`);

    if (!oldToken) {
      this.logger.error('No token provided for renewal');
      return;
    }

    try {
      // Use 3-hour grace period like Go server (line 17)
      const gracefulPeriod = 60 * 60 * 3; // 3 hours in seconds
      const newToken = this.authService.renewPlugNmeetToken(oldToken, gracefulPeriod);

      // Broadcast new token to user
      await this.natsService.broadcastSystemEvent(
        NatsMsgServerToClientEvents.RESP_RENEW_PNM_TOKEN,
        roomId,
        newToken,
        userId,
      );

      this.logger.log(`Successfully renewed token for ${userId}`);
    } catch (error: any) {
      this.logger.error(`Error renewing token for ${userId}: ${error.message}`);
      // Don't send error to client - they'll get expired token error
    }
  }
}
