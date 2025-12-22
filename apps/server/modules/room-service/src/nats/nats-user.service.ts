/**
 * NATS User Service
 * Equivalent to Go: plugNmeet-server/pkg/services/nats/user_modify.go
 * 
 * Handles NATS KV operations for user information and modification
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { UserMetadata } from '@workspace/protocol';
import { UserMetadataSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { NatsService } from './nats.service';
import { v4 as uuidv4 } from 'uuid';

// Constants matching Go
const NATS_PREFIX = 'pnm:';
const ROOM_USERS_BUCKET_PREFIX = `${NATS_PREFIX}roomUsers-`;
const ROOM_USERS_BUCKET = `${ROOM_USERS_BUCKET_PREFIX}%s`;

const USER_INFO_BUCKET_PREFIX = `${NATS_PREFIX}userInfo-`;
const USER_INFO_BUCKET = `${USER_INFO_BUCKET_PREFIX}r_%s-u_%s`;

const ROOM_USERS_BLOCK_LIST = `${NATS_PREFIX}usersBlockList-%s`;

const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 * 1000000; // 7 days in nanoseconds
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
 * Equivalent to Go: NatsService (user_modify.go)
 */
@Injectable()
export class NatsUserService {
    private readonly logger = new Logger(NatsUserService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly natsService: NatsService,
    ) { }

    /**
     * AddUser adds a new user to a room and stores their metadata
     * Equivalent to Go: s.AddUser
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
            ttl: DEFAULT_TTL,
            replicas: numReplicas,
        });

        // Step 5: Marshal metadata
        const mt = this.natsService.marshalUserMetadata(metadata || create(UserMetadataSchema, {}));

        // Step 6: Prepare user data
        const data: Record<string, string> = {
            [USER_ID_KEY]: userId,
            [USER_SID_KEY]: uuidv4(),
            [USER_NAME_KEY]: name,
            [USER_ROOM_ID_KEY]: roomId,
            [USER_IS_ADMIN_KEY]: isAdmin.toString(),
            [USER_IS_PRESENTER_KEY]: isPresenter.toString(),
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
     * Equivalent to Go: s.UpdateUserStatus
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
     * Equivalent to Go: s.UpdateUserMetadata
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
     * Equivalent to Go: s.DeleteUser
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
     * Equivalent to Go: s.DeleteAllRoomUsersWithConsumer
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

                // TODO: Delete consumer
                // this.deleteConsumer(roomId, userId);
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
     * Equivalent to Go: s.UpdateUserKeyValue
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
     * Equivalent to Go: s.AddUserToBlockList
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
     * Equivalent to Go: s.DeleteRoomUsersBlockList
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
}
