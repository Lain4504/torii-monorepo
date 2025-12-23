/**
 * NATS System Events Service
 * Equivalent to Go: plugNmeet-server/pkg/services/nats/sys_events.go
 * 
 * Handles broadcasting system events to clients via NATS JetStream
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
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
} from '@workspace/protocol';
import { ConfigService } from '@nestjs/config';
import { NatsUserInfoService } from './nats-user-info.service';

import { NatsService } from './nats.service';

/**
 * NatsSystemEventsService handles system-wide event broadcasting
 * Equivalent to Go: NatsService methods in sys_events.go
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
    ) {
        // Initialize subjects from config
        this.subjectSystemPublic = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PUBLIC', 'pnm-system-public');
        this.subjectSystemPrivate = this.configService.get<string>('NATS_SUBJECT_SYSTEM_PRIVATE', 'pnm-system-private');
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
     * Equivalent to Go: s.BroadcastSystemEventToRoom
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
     * Equivalent to Go: s.BroadcastSystemEventToEveryoneExceptUserId
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
     * Equivalent to Go: s.BroadcastSystemNotificationToRoom
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
     * Equivalent to Go: s.NotifyInfoMsg
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
     * Equivalent to Go: s.NotifyWarningMsg
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
     * Equivalent to Go: s.NotifyErrorMsg
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
}
