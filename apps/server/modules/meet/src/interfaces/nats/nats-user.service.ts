/**
 * NATS User Service
 *
 * Handles NATS KV operations for user information and modification
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UserMetadata } from '@workspace/protocol';
import { UserMetadataSchema, NatsMsgServerToClientEvents } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { NatsService } from './nats.service';
import { v4 as uuidv4 } from 'uuid';
import { NatsUserInfoService } from './nats-user-info.service';
import { NatsSystemEventsService } from './nats-system-events.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';

// Constants
const NATS_PREFIX = 'wajlc-';  // Must use dash, not colon! NATS bucket names cannot contain ':'
const ROOM_USERS_BUCKET_PREFIX = `${NATS_PREFIX}roomUsers-`;
const ROOM_USERS_BUCKET = `${ROOM_USERS_BUCKET_PREFIX}%s`;

const USER_INFO_BUCKET_PREFIX = `${NATS_PREFIX}userInfo-`;
const USER_INFO_BUCKET = `${USER_INFO_BUCKET_PREFIX}r_%s-u_%s`;

const ROOM_USERS_BLOCK_LIST = `${NATS_PREFIX}usersBlockList-%s`;

const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const USER_ONLINE_MAX_PING_DIFF = 2 * 60 * 1000; // 2 minutes in ms

// User KV keys
const USER_ID_KEY = 'id';
const USER_SID_KEY = 'sid';
const USER_NAME_KEY = 'name';
const USER_ROOM_ID_KEY = 'room_id';
const USER_IS_ADMIN_KEY = 'is_admin';
const USER_IS_PRESENTER_KEY = 'is_presenter';
const USER_METADATA_KEY = 'metadata';
const USER_JOINED_AT = 'joined_at';
const USER_RECONNECTED_AT = 'reconnected_at';
const USER_DISCONNECTED_AT = 'disconnected_at';
const USER_LAST_PING_AT = 'last_ping_at';

// User status constants
export const USER_STATUS_ADDED = 'added';
export const USER_STATUS_ONLINE = 'online';
export const USER_STATUS_DISCONNECTED = 'disconnected';
export const USER_STATUS_OFFLINE = 'offline';

/**
 * NatsUserService handles NATS KV operations for users
 */
@Injectable()
export class NatsUserService {
    private readonly logger = new Logger(NatsUserService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly natsService: NatsService,
        private readonly natsUserInfo: NatsUserInfoService,
        @Inject(forwardRef(() => NatsSystemEventsService)) private readonly natsSystemEvents: NatsSystemEventsService,
        private readonly livekitService: LiveKitService,
    ) { }

    /**
     * AddUser adds a new user to a room and stores their metadata
     */
    async addUser(
        roomId: string,
        userId: string,
        name: string,
        isAdmin: boolean,
        isPresenter: boolean,
        metadata?: UserMetadata,
    ): Promise<void> {
        this.logger.log(`Adding user ${userId} to room ${roomId}`);

        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;
        const js = this.natsService.getJetStream();

        // Step 1: Create or update the room users bucket
        const roomBucket = ROOM_USERS_BUCKET.replace('%s', roomId);
        const roomKV = await js.views.kv(roomBucket, {
            history: 1,
            ttl: DEFAULT_TTL,
            replicas: numReplicas,
        });

        // Step 2: Add user status to the room bucket
        await roomKV.put(userId, new TextEncoder().encode(USER_STATUS_ADDED));

        // Step 3: Add watcher for user status bucket
        this.natsService.getCacheService().addRoomUserStatusWatcher(roomKV, roomBucket, roomId);

        // Step 4: Create or update the user info bucket
        const userBucket = USER_INFO_BUCKET.replace('%s', roomId).replace('%s', userId);
        const userKV = await js.views.kv(userBucket, {
            history: 1,
            ttl: 24 * 60 * 60 * 1000, // 24 hours in ms
            replicas: numReplicas,
        });

        // Step 5: Marshal metadata
        const mt = this.natsService.marshalUserMetadata(metadata || create(UserMetadataSchema, {}));

        // Step 6: Prepare user data
        // Ensure isAdmin and isPresenter default to false if undefined x
        const data: Record<string, string> = {
            [USER_ID_KEY]: userId,
            [USER_SID_KEY]: uuidv4(),
            [USER_NAME_KEY]: name,
            [USER_ROOM_ID_KEY]: roomId,
            [USER_IS_ADMIN_KEY]: (isAdmin || false).toString(),
            [USER_IS_PRESENTER_KEY]: (isPresenter || false).toString(),
            [USER_METADATA_KEY]: mt,
            [USER_LAST_PING_AT]: '0',
        };

        // Step 7: Store user data in the key-value store
        for (const [key, value] of Object.entries(data)) {
            await userKV.put(key, new TextEncoder().encode(value));
        }

        // Step 8: Add to user info watcher
        this.natsService.getCacheService().addUserInfoWatcher(userKV, userBucket, roomId, userId);

        this.logger.log(`User ${userId} added to room ${roomId} successfully`);
    }

    /**
     * UpdateUserStatus updates the status of a user in a room
     */
    async updateUserStatus(roomId: string, userId: string, status: string): Promise<void> {
        this.logger.log(`Updating user ${userId} status in room ${roomId} to ${status}`);

        const js = this.natsService.getJetStream();

        // Step 1: Retrieve the room users bucket
        const roomBucket = ROOM_USERS_BUCKET.replace('%s', roomId);
        const roomKV = await js.views.kv(roomBucket);

        // Step 2: Update user status in the room bucket
        await roomKV.put(userId, new TextEncoder().encode(status));

        // Step 3: Retrieve the user info bucket
        const userBucket = USER_INFO_BUCKET.replace('%s', roomId).replace('%s', userId);
        const userKV = await js.views.kv(userBucket);

        // Step 4: Update user info based on status
        const now = Date.now();

        switch (status) {
            case USER_STATUS_ONLINE:
                // Check if user has joined before
                const joined = await userKV.get(USER_JOINED_AT).catch(() => null);
                if (joined && joined.value && joined.value.length > 0) {
                    // Reconnected
                    await userKV.put(USER_RECONNECTED_AT, new TextEncoder().encode(now.toString()));
                } else {
                    // First time joining
                    await userKV.put(USER_JOINED_AT, new TextEncoder().encode(now.toString()));
                }
                break;

            case USER_STATUS_DISCONNECTED:
            case USER_STATUS_OFFLINE:
                await userKV.put(USER_DISCONNECTED_AT, new TextEncoder().encode(now.toString()));
                break;
        }

        this.logger.log(`User ${userId} status updated to ${status}`);
    }

    /**
     * UpdateUserMetadata updates the metadata of a user
     */
    async updateUserMetadata(roomId: string, userId: string, metadata: UserMetadata | string): Promise<string> {
        let mt: UserMetadata;

        // Determine the type of metadata and unmarshal accordingly
        if (typeof metadata === 'string') {
            mt = this.natsService.unmarshalUserMetadata(metadata);
        } else {
            mt = metadata;
        }

        // Marshal the updated metadata
        const marshal = this.natsService.marshalUserMetadata(mt);

        // Update the user metadata in the key-value store
        await this.updateUserKeyValue(roomId, userId, USER_METADATA_KEY, marshal);

        return marshal;
    }

    /**
     * DeleteUser removes a user from a room and deletes their metadata
     */
    async deleteUser(roomId: string, userId: string): Promise<void> {
        this.logger.log(`Deleting user ${userId} from room ${roomId}`);

        const js = this.natsService.getJetStream();
        const jsm = this.natsService.getJetStreamManager();

        try {
            // Step 1: Purge user from room users bucket
            const roomBucket = ROOM_USERS_BUCKET.replace('%s', roomId);
            const roomKV = await js.views.kv(roomBucket);
            await roomKV.purge(userId);
        } catch (error) {
            // Silently ignore if bucket not found
        }

        try {
            // Step 2: Delete the user info bucket
            const userBucket = USER_INFO_BUCKET.replace('%s', roomId).replace('%s', userId);
            await jsm.streams.delete(`KV_${userBucket}`);
        } catch (error) {
            // Silently ignore if bucket not found
        }

        this.logger.log(`User ${userId} deleted from room ${roomId}`);
    }

    /**
     * DeleteAllRoomUsersWithConsumer deletes all users from a room and their consumers
     */
    async deleteAllRoomUsersWithConsumer(roomId: string): Promise<void> {
        this.logger.log(`Deleting all users from room ${roomId}`);

        const js = this.natsService.getJetStream();
        const jsm = this.natsService.getJetStreamManager();

        try {
            // Step 1: Retrieve the room users bucket
            const roomBucket = ROOM_USERS_BUCKET.replace('%s', roomId);
            const roomKV = await js.views.kv(roomBucket);

            // Step 2: List all user keys in the room users bucket
            const keys = await roomKV.keys();

            // Step 3: Delete each user's info bucket and associated consumer
            for await (const userId of keys) {
                try {
                    // Delete user info bucket
                    const userBucket = USER_INFO_BUCKET.replace('%s', roomId).replace('%s', userId);
                    await jsm.streams.delete(`KV_${userBucket}`);
                } catch (error) {
                    // Silently ignore
                }

                // Delete consumer for this user
                try {
                    await this.natsService.deleteConsumer(roomId, userId);
                } catch (error) {
                    // Silently ignore consumer deletion errors
                }
            }

            // Step 4: Delete the room users bucket
            await jsm.streams.delete(`KV_${roomBucket}`);

            this.logger.log(`All users deleted from room ${roomId}`);
        } catch (error) {
            if (error.message && error.message.includes('stream not found')) {
                // No users bucket found, return silently
                return;
            }
            throw error;
        }
    }

    /**
     * UpdateUserKeyValue updates a specific key-value pair for a user
     */
    async updateUserKeyValue(roomId: string, userId: string, key: string, value: string): Promise<void> {
        const js = this.natsService.getJetStream();

        // Retrieve the user info bucket
        const userBucket = USER_INFO_BUCKET.replace('%s', roomId).replace('%s', userId);
        const userKV = await js.views.kv(userBucket);

        // Update the key-value pair
        await userKV.put(key, new TextEncoder().encode(value));
    }

    /**
     * AddUserToBlockList adds a user to the block list for a room
     */
    async addUserToBlockList(roomId: string, userId: string): Promise<number> {
        this.logger.log(`Adding user ${userId} to block list for room ${roomId}`);

        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;
        const js = this.natsService.getJetStream();

        // Create or update the room users block list bucket
        const blockListBucket = ROOM_USERS_BLOCK_LIST.replace('%s', roomId);
        const blockListKV = await js.views.kv(blockListBucket, {
            replicas: numReplicas,
        });

        // Add the user to the block list with the current timestamp
        const seq = await blockListKV.put(userId, new TextEncoder().encode(Date.now().toString()));

        return seq;
    }

    /**
     * DeleteRoomUsersBlockList deletes the block list for a room
     */
    async deleteRoomUsersBlockList(roomId: string): Promise<void> {
        const jsm = this.natsService.getJetStreamManager();

        try {
            const blockListBucket = ROOM_USERS_BLOCK_LIST.replace('%s', roomId);
            await jsm.streams.delete(`KV_${blockListBucket}`);
        } catch (error) {
            // Silently ignore if not found
        }
    }

    /**
     * BroadcastUserMetadata will broadcast user metadata update event to room
     */
    async broadcastUserMetadata(roomId: string, userId: string, metadata?: string, toUser?: string): Promise<void> {
        let metadataStr = metadata;

        // If metadata not provided, get it from NATS
        if (!metadataStr) {
            const userInfo = await this.natsUserInfo.getUserInfo(roomId, userId);
            if (!userInfo) {
                throw new Error('User not found');
            }
            metadataStr = userInfo.metadata;
        }

        const data = {
            metadata: metadataStr,
            userId: userId,
        };

        // Broadcast to room using system events
        await this.natsSystemEvents.broadcastSystemEventToRoom(
            NatsMsgServerToClientEvents.USER_METADATA_UPDATE,
            roomId,
            data,
            toUser,
        );
    }

    /**
     * UpdateAndBroadcastUserMetadata will update metadata & broadcast to everyone
     */
    async updateAndBroadcastUserMetadata(
        roomId: string,
        userId: string,
        meta: UserMetadata | null,
        toUserId?: string | null,
    ): Promise<void> {
        if (!meta) {
            throw new Error('Metadata cannot be nil');
        }

        // Update the metadata
        const mt = await this.updateUserMetadata(roomId, userId, meta);

        // Broadcast the update
        await this.broadcastUserMetadata(roomId, userId, mt, toUserId || undefined);
    }

    /**
     * BroadcastUserInfoToRoom broadcasts user info to all participants in room
     */
    async broadcastUserInfoToRoom(
        event: NatsMsgServerToClientEvents,
        roomId: string,
        userId: string,
        userInfo?: any,  // NatsKvUserInfo
    ): Promise<void> {
        let info = userInfo;

        // If userInfo not provided, get it from NATS
        if (!info) {
            info = await this.natsUserInfo.getUserInfo(roomId, userId);
            if (!info) {
                this.logger.warn(`User info not found for ${userId} in room ${roomId}`);
                return;
            }
        }

        try {
            await this.natsSystemEvents.broadcastSystemEventToRoom(
                event,
                roomId,
                info,
                undefined,
            );
        } catch (error) {
            this.logger.warn(`Failed to broadcast user info: ${error.message}`);
        }
    }

    // ============================================================================
    // User Lifecycle Event Handlers
    // ============================================================================

    /**
     * OnAfterUserJoined handles user joined event
     */
    async onAfterUserJoined(roomId: string, userId: string): Promise<void> {
        const log = this.logger;
        log.log(`Handling user joined event: room=${roomId}, user=${userId}`);

        try {
            const status = await this.natsUserInfo.getRoomUserStatus(roomId, userId);

            // If user is already online, don't proceed (frequent case due to pings)
            if (status === USER_STATUS_ONLINE) {
                return;
            }

            // Update user status to online
            await this.updateUserStatus(roomId, userId, USER_STATUS_ONLINE);

            // Get user info
            const userInfo = await this.natsUserInfo.getUserInfo(roomId, userId);
            if (userInfo) {
                // Broadcast USER_JOINED to everyone except this user
                try {
                    await this.natsSystemEvents.broadcastSystemEventToEveryoneExceptUserId(
                        NatsMsgServerToClientEvents.USER_JOINED,
                        roomId,
                        userInfo,
                        userId
                    );
                } catch (error) {
                    log.error(`Failed to broadcast USER_JOINED event: ${error.message}`);
                }

                // Send analytics
                const now = Date.now();
                // TODO: Implement analytics service
                // await this.analyticsService.handleEvent({
                //     eventType: AnalyticsEventType.ROOM,
                //     eventName: AnalyticsEvents.ANALYTICS_EVENT_USER_JOINED,
                //     roomId,
                //     userId,
                //     userName: userInfo.name,
                //     extraData: userInfo.metadata,
                //     hsetValue: now.toString(),
                // });

                log.log('Successfully processed user joined event');
            }
        } catch (error) {
            log.error(`Failed to process user joined event: ${error.message}`);
        }
    }

    /**
     * OnAfterUserDisconnected handles user disconnected event
     *
     * This runs in background. We wait 5s before declaring user offline
     * but broadcast disconnected status immediately
     */
    async onAfterUserDisconnected(roomId: string, userId: string): Promise<void> {
        const log = this.logger;
        log.log(`Handling user disconnected event: room=${roomId}, user=${userId}`);

        // Immediately set status to disconnected and notify clients
        try {
            await this.updateUserStatus(roomId, userId, USER_STATUS_DISCONNECTED);
        } catch (error) {
            log.warn(`Failed to update user status to disconnected: ${error.message}`);
        }

        // Try to get user info for a richer disconnect message
        let userInfo: any = null;
        try {
            userInfo = await this.natsUserInfo.getUserInfo(roomId, userId);
        } catch (error) {
            log.warn(`Could not get user info: ${error.message}`);
        }

        // Broadcast USER_DISCONNECTED event
        const basicUserInfo = userInfo || { userId, roomId };
        try {
            await this.natsSystemEvents.broadcastSystemEventToEveryoneExceptUserId(
                NatsMsgServerToClientEvents.USER_DISCONNECTED,
                roomId,
                basicUserInfo,
                userId
            );
        } catch (error) {
            log.error(`Failed to broadcast USER_DISCONNECTED event: ${error.message}`);
        }

        // Start background task to handle delayed offline tasks
        // Use setImmediate to run in background
        setImmediate(() => this.handleDelayedOfflineTasks(roomId, userId, userInfo));
    }

    /**
     * handleDelayedOfflineTasks manages grace period for user reconnection and cleanup
     */
    private async handleDelayedOfflineTasks(roomId: string, userId: string, userInfo: any): Promise<void> {
        const log = this.logger;
        log.log(`Starting delayed offline tasks: room=${roomId}, user=${userId}`);

        // Stage 1: Wait for reconnection grace period (5 seconds)
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            const status = await this.natsUserInfo.getRoomUserStatus(roomId, userId);
            if (status === USER_STATUS_ONLINE) {
                // User reconnected, abort offline tasks
                log.log('User reconnected within grace period, aborting offline tasks');
                return;
            }
        } catch (error) {
            log.warn(`Failed to check user status: ${error.message}`);
        }

        // User is still disconnected, mark as offline
        try {
            await this.updateUserStatus(roomId, userId, USER_STATUS_OFFLINE);
        } catch (error) {
            log.warn(`Failed to update user status to offline: ${error.message}`);
        }

        // Send analytics for user leaving
        this.updateUserLeftAnalytics(roomId, userId);

        // Broadcast final USER_OFFLINE status
        const finalUserInfo = userInfo || { userId };
        try {
            await this.natsSystemEvents.broadcastSystemEventToEveryoneExceptUserId(
                NatsMsgServerToClientEvents.USER_OFFLINE,
                roomId,
                finalUserInfo,
                userId
            );
        } catch (error) {
            // Ignore NoOnlineUserFound error
            if (!error.message.includes('no online user found')) {
                log.warn(`Failed to broadcast USER_OFFLINE event: ${error.message}`);
            }
        }

        // Stage 2: Wait longer before final cleanup (30 seconds)
        await new Promise(resolve => setTimeout(resolve, 30000));

        try {
            const status = await this.natsUserInfo.getRoomUserStatus(roomId, userId);
            if (status === USER_STATUS_ONLINE) {
                // User reconnected, do not delete consumer
                log.log('User reconnected before final cleanup, consumer will not be deleted');
                return;
            }
        } catch (error) {
            log.warn(`Failed to check final user status: ${error.message}`);
        }

        // Also try to silently remove this user from LiveKit as well
        try {
            await this.livekitService.removeParticipant(roomId, userId);
        } catch (error) {
            // Silent fail - user may have already been removed
            log.debug(`Could not remove participant from LiveKit: ${error.message}`);
        }

        // Final cleanup: Delete user's NATS consumer
        try {
            await this.natsService.deleteConsumer(roomId, userId);
        } catch (error) {
            log.error(`Failed to delete consumer: ${error.message}`);
        }

        log.log('User offline tasks completed');
    }

    /**
     * updateUserLeftAnalytics sends analytics for user leaving
     */
    private updateUserLeftAnalytics(roomId: string, userId: string): void {
        const now = Date.now();

        // TODO: Implement analytics service
        // this.analyticsService.handleEvent({
        //     eventType: AnalyticsEventType.USER,
        //     eventName: AnalyticsEvents.ANALYTICS_EVENT_USER_LEFT,
        //     roomId,
        //     userId,
        //     hsetValue: now.toString(),
        // });
    }
}
