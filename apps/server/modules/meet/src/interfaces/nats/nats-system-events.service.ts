/**
 * NATS System Events Service
 *
 * Handles broadcasting system events to clients via NATS JetStream
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import type { JetStreamClient } from 'nats';
import { v4 as uuidv4 } from 'uuid';
import { create, toBinary, toJsonString } from '@bufbuild/protobuf';
import {
    NatsMsgServerToClient,
    NatsMsgServerToClientSchema,
    NatsMsgServerToClientEvents,
    NatsSystemNotification,
    NatsSystemNotificationSchema,
    NatsSystemNotificationTypes,
    NatsInitialData,
    NatsInitialDataSchema,
    MediaServerConnInfo,
    MediaServerConnInfoSchema,
} from '@workspace/protocol';
import { ConfigService } from '@nestjs/config';
import { NatsUserInfoService } from './nats-user-info.service';
import { NatsRoomService } from './nats-room.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';
import { WajlcAuthService } from '../../modules/auth/wajlc-auth.service';
import { NatsUserService } from './nats-user.service';

import { NatsService } from './nats.service';

/**
 * NatsSystemEventsService handles system-wide event broadcasting
 */
@Injectable()
export class NatsSystemEventsService {
    private readonly logger = new Logger(NatsSystemEventsService.name);
    private js: JetStreamClient;
    private subjectSystemPublic: string;
    private subjectSystemPrivate: string;

    constructor(
        private readonly natsService: NatsService,
        private readonly configService: ConfigService,
        private readonly natsUserInfo: NatsUserInfoService,
        @Inject(forwardRef(() => NatsRoomService)) private readonly natsRoomService: NatsRoomService,
        private readonly livekitService: LiveKitService,
        private readonly authService: WajlcAuthService,
        @Inject(forwardRef(() => NatsUserService)) private readonly natsUserService: NatsUserService,
    ) {
        // Initialize subjects from config
        this.subjectSystemPublic = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC', 'sysPublic');
        this.subjectSystemPrivate = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE', 'sysPrivate');
    }

    onModuleInit() {
        // Get JetStream client from NatsService
        // Must be done in onModuleInit because NatsService connects in its onModuleInit
        // But to be safe we can access it when needed, or check if connected
        this.js = this.natsService.getJetStream();
        if (!this.js) {
            this.logger.warn('JetStream client not ready yet in constructor, will be fetched in onModuleInit or methods');
        }
    }

    /**
     * BroadcastSystemEventToRoom broadcasts a system event to all clients in a room
     *
     * @param event - Event type (from NatsMsgServerToClientEvents enum)
     * @param roomId - Room ID
     * @param data - Event data (string, number, object, or protobuf message)
     * @param toUserId - Optional user ID to send to specific user only
     */
    async broadcastSystemEventToRoom(
        event: NatsMsgServerToClientEvents,
        roomId: string,
        data: any,
        toUserId?: string,
    ): Promise<void> {
        // Convert data to string message
        let msg: string;

        if (typeof data === 'string') {
            msg = data;
        } else if (typeof data === 'number') {
            msg = String(data);
        } else if (data instanceof Uint8Array) {
            msg = new TextDecoder().decode(data);
        } else if (typeof data === 'object' && data.$typeName) {
            // Protobuf message - convert to JSON
            msg = toJsonString(data.$type, data);
        } else if (typeof data === 'object') {
            // Plain object - stringify
            msg = JSON.stringify(data);
        } else {
            throw new Error('invalid data type');
        }

        // Create NATS message payload
        const payload = create(NatsMsgServerToClientSchema, {
            id: uuidv4(),
            event: event,
            msg: msg,
        });

        // Marshal to binary protobuf
        const message = toBinary(NatsMsgServerToClientSchema, payload);

        // Determine subject (public or private)
        let subject: string;
        if (toUserId) {
            // Private message to specific user
            subject = `${roomId}:${this.subjectSystemPrivate}.${toUserId}.system`;
        } else {
            // Public message to all users in room
            subject = `${roomId}:${this.subjectSystemPublic}.system`;
        }

        // Ensure JetStream client is ready
        if (!this.js) {
            this.js = this.natsService.getJetStream();
            if (!this.js) {
                this.logger.warn('JetStream client not ready, cannot broadcast event');
                return;
            }
        }

        // Publish to NATS
        try {
            await this.js.publish(subject, message);
            this.logger.debug(`Broadcast event ${NatsMsgServerToClientEvents[event]} to ${subject}`);
        } catch (error) {
            this.logger.error(`Failed to broadcast event: ${error.message}`);
            throw error;
        }
    }

    /**
     * BroadcastSystemEventToEveryoneExceptUserId broadcasts to all users except one
     *
     * @param event - Event type
     * @param roomId - Room ID
     * @param data - Event data
     * @param exceptUserId - User ID to exclude
     */
    async broadcastSystemEventToEveryoneExceptUserId(
        event: NatsMsgServerToClientEvents,
        roomId: string,
        data: any,
        exceptUserId: string,
    ): Promise<void> {
        // Get online users from NATS
        const userIds = await this.natsUserInfo.getOnlineUsersId(roomId);

        if (!userIds || userIds.length === 0) {
            this.logger.warn(`No online users found in room ${roomId}`);
            return;
        }

        // Send to each user except the excluded one
        const sendPromises = userIds
            .filter(id => id !== exceptUserId)
            .map(async (id) => {
                try {
                    await this.broadcastSystemEventToRoom(event, roomId, data, id);
                } catch (error) {
                    this.logger.error(`Failed to broadcast to user ${id}: ${error.message}`);
                }
            });

        await Promise.all(sendPromises);
    }

    /**
     * BroadcastSystemNotificationToRoom sends a notification to room
     *
     * @param roomId - Room ID
     * @param msg - Notification message
     * @param msgType - Notification type (INFO, WARNING, ERROR)
     * @param withSound - Whether to play sound
     * @param userId - Optional user ID for private notification
     */
    async broadcastSystemNotificationToRoom(
        roomId: string,
        msg: string,
        msgType: NatsSystemNotificationTypes,
        withSound: boolean,
        userId?: string,
    ): Promise<void> {
        const notification = create(NatsSystemNotificationSchema, {
            id: uuidv4(),
            type: msgType,
            msg: msg,
            sentAt: Date.now().toString(), // Convert to string for int64
            withSound: withSound,
        });

        // Convert to JSON string
        const jsonStr = toJsonString(NatsSystemNotificationSchema, notification);

        await this.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.SYSTEM_NOTIFICATION,
            roomId,
            jsonStr,
            userId,
        );
    }

    /**
     * NotifyInfoMsg sends an info notification
     */
    async notifyInfoMsg(
        roomId: string,
        msg: string,
        withSound: boolean,
        userId?: string,
    ): Promise<void> {
        await this.broadcastSystemNotificationToRoom(
            roomId,
            msg,
            NatsSystemNotificationTypes.NATS_SYSTEM_NOTIFICATION_INFO,
            withSound,
            userId,
        );
    }

    /**
     * NotifyWarningMsg sends a warning notification
     */
    async notifyWarningMsg(
        roomId: string,
        msg: string,
        withSound: boolean,
        userId?: string,
    ): Promise<void> {
        await this.broadcastSystemNotificationToRoom(
            roomId,
            msg,
            NatsSystemNotificationTypes.NATS_SYSTEM_NOTIFICATION_WARNING,
            withSound,
            userId,
        );
    }

    /**
     * NotifyErrorMsg sends an error notification
     */
    async notifyErrorMsg(
        roomId: string,
        msg: string,
        userId?: string,
    ): Promise<void> {
        await this.broadcastSystemNotificationToRoom(
            roomId,
            msg,
            NatsSystemNotificationTypes.NATS_SYSTEM_NOTIFICATION_ERROR,
            true, // always with sound
            userId,
        );
    }

    /**
     * HandleInitialData handles Request for Initial Data
     */
    async handleInitialData(roomId: string, userId: string): Promise<void> {
        this.logger.debug(`Handling initial data request for room ${roomId}, user ${userId}`);

        // 1. Get Room Info
        const rInfo = await this.natsRoomService.getRoomInfo(roomId);
        if (!rInfo) {
            this.logger.error(`Room info not found for ${roomId}`);
            await this.notifyErrorMsg(roomId, 'room information not found', userId);
            return;
        }

        // 2. Get User Info
        const userInfo = await this.natsUserInfo.getUserInfo(roomId, userId);
        if (!userInfo) {
            this.logger.error(`User info not found for ${userId} in room ${roomId}`);
            await this.notifyErrorMsg(roomId, 'no user found', userId);
            return;
        }

        // 3. Generate Media Server Info (LiveKit Token)
        let mediaServerInfo: MediaServerConnInfo | undefined;
        try {
            mediaServerInfo = await this.handleMediaServerInfo(roomId, userId, userInfo, false);
        } catch (error) {
            this.logger.error(`Failed to generate media server info: ${error.message}`);
            await this.notifyErrorMsg(roomId, error.message, userId);
            return;
        }

        if (!mediaServerInfo) {
            return;
        }

        // 4. Create Response
        const initialData = create(NatsInitialDataSchema, {
            room: rInfo,
            localUser: userInfo,
            mediaServerInfo: mediaServerInfo,
        });

        // 5. Send Response
        // Convert to JSON string because Protobuf schema expects `msg` field to be string in NatsMsgServerToClient
        // but here we are sending a complex object that client expects to parse
        const msg = toJsonString(NatsInitialDataSchema, initialData);

        await this.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.RES_INITIAL_DATA,
            roomId,
            msg,
            userId,
        );
    }

    /**
     * HandleSendUsersList handles Request for users list
     */
    async handleSendUsersList(roomId: string, userId: string): Promise<void> {
        this.logger.debug(`Handling users list request for room ${roomId}, user ${userId}`);

        try {
            const usersJson = await this.natsUserInfo.getOnlineUsersListAsJson(roomId);
            if (usersJson) {
                await this.broadcastSystemEventToRoom(
                    NatsMsgServerToClientEvents.RES_JOINED_USERS_LIST,
                    roomId,
                    usersJson,
                    userId,
                );
            }
        } catch (error) {
            this.logger.error(`Failed to get online users list: ${error.message}`);
        }
    }

    /**
     * HandleMediaServerInfo handles Request for media server info (LiveKit token)
     */
    async handleMediaServerInfo(
        roomId: string,
        userId: string,
        userInfo?: any,
        broadcast: boolean = false
    ): Promise<MediaServerConnInfo | undefined> {
        // Get user info if not provided
        if (!userInfo) {
            const info = await this.natsUserInfo.getUserInfo(roomId, userId);
            if (!info) {
                this.logger.error(`User info not found for ${userId} in room ${roomId}`);
                await this.notifyErrorMsg(roomId, 'no user found', userId);
                return undefined;
            }
            userInfo = info;
        }

        // Generate LiveKit Token
        let token: string;
        try {
            token = await this.livekitService.generateLivekitToken(roomId, userInfo);
        } catch (error) {
            this.logger.error(`Failed to generate livekit token: ${error.message}`);
            await this.notifyErrorMsg(roomId, error.message, userId);
            return undefined;
        }

        // Get LiveKit WebSocket URL for client browser connection
        // LIVEKIT_WS_URL (wss://) is for client browsers to connect to LiveKit media server
        // LIVEKIT_API_URL (https://) is for server SDK to call LiveKit REST API
        let lkHost = this.configService.get<string>('LIVEKIT_WS_URL', 'ws://localhost:7880');
        if (lkHost.includes('host.docker.internal')) {
            lkHost = lkHost.replace('host.docker.internal', 'localhost');
        }

        const data = create(MediaServerConnInfoSchema, {
            url: lkHost,
            token: token,
        });

        // DEBUG: Log the actual data being sent to client
        this.logger.log(`[MediaServerInfo] Sending to user ${userId}: url=${lkHost}, token_length=${token.length}`);

        if (broadcast) {
            // Convert to JSON string for broadcasting
            const msg = toJsonString(MediaServerConnInfoSchema, data);
            await this.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.RES_MEDIA_SERVER_DATA,
                roomId,
                msg,
                userId,
            );
        }

        return data;
    }

    /**
     * HandleClientPing handles PING from client

     */
    async handleClientPing(roomId: string, userId: string): Promise<void> {
        // Check user status via NatsUserService (circular dependency handled with forwardRef)

        await this.natsUserService.onAfterUserJoined(roomId, userId);

        // Update last ping time

        const now = Date.now().toString();
        try {
            await this.natsUserInfo.updateUserKeyValue(roomId, userId, 'last_ping_at', now);
        } catch (error) {
            this.logger.error(`Error updating user last ping for ${userId}: ${error.message}`);
        }
    }

    /**
     * RenewWajlcToken handles token renewal request
     */
    async renewWajlcToken(roomId: string, userId: string, currentToken: string): Promise<void> {
        try {
            // Graceful period of 3 hours 
            // But renewToken usually takes just the old token
            // We need to check if renewToken supports graceful period or custom expiry
            // Assuming standard renewal for now
            const newToken = await this.authService.renewWajlcToken(currentToken);

            await this.broadcastSystemEventToRoom(
                NatsMsgServerToClientEvents.RESP_RENEW_WAJLC_TOKEN,
                roomId,
                newToken,
                userId,
            );
        } catch (error) {
            this.logger.error(`Error renewing Wajlc token for ${userId}: ${error.message}`);
        }
    }
}
