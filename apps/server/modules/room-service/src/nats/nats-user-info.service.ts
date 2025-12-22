/**
 * NATS User Info Service
 * Equivalent to Go: plugNmeet-server/pkg/services/nats/user_info.go
 * 
 * Handles NATS KV read operations for user information
 */

import { Injectable, Logger } from '@nestjs/common';
import type { NatsKvUserInfo } from '@workspace/protocol';
import { NatsKvUserInfoSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { NatsService } from './nats.service';

// Constants matching Go
const NATS_PREFIX = 'pnm:';
const ROOM_USERS_BUCKET = `${NATS_PREFIX}roomUsers-%s`;
const USER_INFO_BUCKET = `${NATS_PREFIX}userInfo-r_%s-u_%s`;
const ROOM_USERS_BLOCK_LIST = `${NATS_PREFIX}usersBlockList-%s`;

// User KV keys (matching Go constants)
const USER_ID_KEY = 'id';
const USER_SID_KEY = 'sid';
const USER_NAME_KEY = 'name';
const USER_ROOM_ID_KEY = 'room_id';
const USER_IS_ADMIN_KEY = 'is_admin';
const USER_IS_PRESENTER_KEY = 'is_presenter';
export const USER_METADATA_KEY = 'metadata'; // Export for use in room-info.service
const USER_JOINED_AT = 'joined_at';
const USER_RECONNECTED_AT = 'reconnected_at';
const USER_DISCONNECTED_AT = 'disconnected_at';
const USER_LAST_PING_AT = 'last_ping_at';

// User status constants
export const USER_STATUS_ONLINE = 'online';

/**
 * NatsUserInfoService handles NATS KV read operations for users
 * Equivalent to Go: NatsService methods in user_info.go
 */
@Injectable()
export class NatsUserInfoService {
    private readonly logger = new Logger(NatsUserInfoService.name);

    constructor(
        private readonly natsService: NatsService,
    ) { }

    /**
     * GetRoomUserStatus retrieves the status of a user in a specific room
     * Equivalent to Go: s.GetRoomUserStatus (lines 14-30)
     * 
     * Returns empty string if user or room not found
     */
    async getRoomUserStatus(roomId: string, userId: string): Promise<string> {
        // Step 1: Try cache first (matching Go)
        const cachedStatus = this.natsService.getCacheService().getCachedRoomUserStatus(roomId, userId);
        if (cachedStatus) {
            return cachedStatus.status;
        }

        // Step 2: Fallback to NATS
        const bucket = ROOM_USERS_BUCKET.replace('%s', roomId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);

            // Step 3: Add watcher (matching Go: if not in cache, start watching)
            this.natsService.getCacheService().addRoomUserStatusWatcher(kv, bucket, roomId);

            // Step 4: Get status value
            const entry = await kv.get(userId);
            if (!entry || !entry.value) {
                return '';
            }
            return new TextDecoder().decode(entry.value);
        } catch (error) {
            this.logger.error(`Failed to get user status: ${error.message}`);
            return '';
        }
    }

    /**
     * GetUserInfo retrieves detailed information about a user in a specific room
     * Equivalent to Go: s.GetUserInfo (lines 34-61)
     * 
     * Returns null if user or room not found
     */
    async getUserInfo(roomId: string, userId: string): Promise<NatsKvUserInfo | null> {
        // Step 1: Try cache first (matching Go)
        const cached = this.natsService.getCacheService().getUserInfo(roomId, userId);
        if (cached) {
            return cached as NatsKvUserInfo;
        }

        // Step 2: Fallback to NATS
        const bucket = USER_INFO_BUCKET.replace('%s', roomId).replace('%s', userId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);

            // Step 3: Build user info from KV (matching Go exactly)
            const info = create(NatsKvUserInfoSchema, {
                userId: await this.getStringValue(kv, USER_ID_KEY),
                userSid: await this.getStringValue(kv, USER_SID_KEY),
                name: await this.getStringValue(kv, USER_NAME_KEY),
                roomId: await this.getStringValue(kv, USER_ROOM_ID_KEY),
                metadata: await this.getStringValue(kv, USER_METADATA_KEY),
                isAdmin: await this.getBoolValue(kv, USER_IS_ADMIN_KEY),
                isPresenter: await this.getBoolValue(kv, USER_IS_PRESENTER_KEY),
                joinedAt: await this.getUint64Value(kv, USER_JOINED_AT),
                reconnectedAt: await this.getUint64Value(kv, USER_RECONNECTED_AT),
                disconnectedAt: await this.getUint64Value(kv, USER_DISCONNECTED_AT),
            });

            // Step 4: Add watcher (matching Go: if not in cache, start watching)
            this.natsService.getCacheService().addUserInfoWatcher(kv, bucket, roomId, userId);

            return info;
        } catch (error) {
            this.logger.error(`Failed to get user info: ${error.message}`);
            return null;
        }
    }

    /**
     * GetUserKeyValue retrieves a specific key-value entry for a user
     * Equivalent to Go: s.GetUserKeyValue (lines 167-173)
     * 
     * Returns null if user or room not found
     */
    async getUserKeyValue(roomId: string, userId: string, key: string): Promise<any | null> {
        const bucket = USER_INFO_BUCKET.replace('%s', roomId).replace('%s', userId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const entry = await kv.get(key);
            return entry;
        } catch (error) {
            this.logger.error(`Failed to get user key value: ${error.message}`);
            return null;
        }
    }

    /**
     * GetOnlineUsersId retrieves IDs of users who are currently online
     * Equivalent to Go: s.GetOnlineUsersId (lines 87-105)
     */
    async getOnlineUsersId(roomId: string): Promise<string[]> {
        // Step 1: Try cache first
        const cachedIds = this.natsService.getCacheService().getUsersIdFromRoomStatusBucket(roomId, USER_STATUS_ONLINE);
        if (cachedIds.length > 0) {
            return cachedIds;
        }

        // Step 2: Fallback to NATS
        const users = await this.getRoomAllUsersFromStatusBucket(roomId);
        if (!users) {
            return [];
        }

        const userIds: string[] = [];
        for (const [id, entry] of Object.entries(users)) {
            if (entry && entry.value) {
                const status = new TextDecoder().decode(entry.value);
                if (status === USER_STATUS_ONLINE) {
                    userIds.push(id);
                }
            }
        }
        return userIds;
    }

    /**
     * GetRoomAllUsersFromStatusBucket retrieves all users and their statuses
     * Equivalent to Go: s.GetRoomAllUsersFromStatusBucket (lines 65-83)
     */
    async getRoomAllUsersFromStatusBucket(roomId: string): Promise<Record<string, any> | null> {
        const bucket = ROOM_USERS_BUCKET.replace('%s', roomId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);

            const users: Record<string, any> = {};
            const keys = await kv.keys();

            for await (const key of keys) {
                try {
                    const entry = await kv.get(key);
                    if (entry) {
                        users[key] = entry;
                    }
                } catch (error) {
                    // Silently ignore per-key errors
                }
            }

            return users;
        } catch (error) {
            this.logger.error(`Failed to get room users: ${error.message}`);
            return null;
        }
    }

    /**
     * IsUserPresenter checks if a user is a presenter
     * Equivalent to Go: s.IsUserPresenter (lines 222-235)
     */
    async isUserPresenter(roomId: string, userId: string): Promise<boolean> {
        // Step 1: Check cache first
        const userInfo = this.natsService.getCacheService().getUserInfo(roomId, userId);
        if (userInfo) {
            return userInfo.isPresenter || false;
        }

        // Step 2: Fallback to NATS
        try {
            const entry = await this.getUserKeyValue(roomId, userId, USER_IS_PRESENTER_KEY);
            if (!entry || !entry.value) {
                return false;
            }
            return new TextDecoder().decode(entry.value) === 'true';
        } catch (error) {
            return false;
        }
    }

    /**
     * IsUserExistInBlockList checks if a user is in the block list
     * Equivalent to Go: s.IsUserExistInBlockList (lines 239-246)
     */
    async isUserExistInBlockList(roomId: string, userId: string): Promise<boolean> {
        const bucket = ROOM_USERS_BLOCK_LIST.replace('%s', roomId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const entry = await kv.get(userId);
            return entry !== null && entry !== undefined;
        } catch (error) {
            return false;
        }
    }

    /**
     * GetUsersIdFromRoomStatusBucket retrieves all user IDs from room status bucket
     * Equivalent to Go: s.GetUsersIdFromRoomStatusBucket (lines 107-123)
     * 
     * Returns empty array if room not found
     */
    async getUsersIdFromRoomStatusBucket(roomId: string): Promise<string[]> {
        let userIds: string[] = [];

        // Step 1: Try cache first (matching Go)
        userIds = this.natsService.getCacheService().getUsersIdFromRoomStatusBucket(roomId, '');
        if (userIds.length > 0) {
            return userIds;
        }

        // Step 2: Fallback to NATS
        const users = await this.getRoomAllUsersFromStatusBucket(roomId);
        if (!users) {
            return userIds;
        }

        // Step 3: Extract all user IDs
        for (const id of Object.keys(users)) {
            userIds.push(id);
        }

        return userIds;
    }

    /**
     * GetOnlineUsersList retrieves detailed information about all online users
     * Equivalent to Go: s.GetOnlineUsersList (lines 127-144)
     * 
     * Returns null if room not found or no users online
     */
    async getOnlineUsersList(roomId: string): Promise<NatsKvUserInfo[] | null> {
        // Step 1: Get online user IDs
        const userIds = await this.getOnlineUsersId(roomId);
        if (!userIds || userIds.length === 0) {
            return null;
        }

        // Step 2: Get detailed info for each user
        const users: NatsKvUserInfo[] = [];
        for (const id of userIds) {
            try {
                const info = await this.getUserInfo(roomId, id);
                if (info) {
                    users.push(info);
                }
            } catch (error) {
                this.logger.error(`Failed to get user info for ${id}: ${error.message}`);
                return null;
            }
        }

        return users;
    }

    /**
     * GetOnlineUsersListAsJson retrieves online users as JSON string
     * Equivalent to Go: s.GetOnlineUsersListAsJson (lines 148-163)
     * 
     * Returns null if room not found or no users online
     */
    async getOnlineUsersListAsJson(roomId: string): Promise<string | null> {
        // Step 1: Get online users list
        const users = await this.getOnlineUsersList(roomId);
        if (!users || users.length === 0) {
            return null;
        }

        // Step 2: Convert to JSON array using protobuf marshaling
        try {
            const jsonArray: string[] = [];
            for (const user of users) {
                // Use NatsService's proto JSON marshaling (matching Go: protoJsonOpts.Marshal)
                const json = this.natsService.marshalToProtoJson(user, NatsKvUserInfoSchema);
                jsonArray.push(json);
            }

            // Return as JSON array string
            return `[${jsonArray.join(',')}]`;
        } catch (error) {
            this.logger.error(`Failed to marshal users to JSON: ${error.message}`);
            return null;
        }
    }

    /**
     * GetUserMetadataStruct retrieves user metadata as structured object
     * Equivalent to Go: s.GetUserMetadataStruct (lines 177-187)
     * 
     * Returns null if user not found or no metadata
     */
    async getUserMetadataStruct(roomId: string, userId: string): Promise<any | null> {
        // Step 1: Get user info
        const info = await this.getUserInfo(roomId, userId);
        if (!info) {
            return null;
        }

        // Step 2: Check if metadata exists
        if (!info.metadata || info.metadata.length === 0) {
            return null;
        }

        // Step 3: Unmarshal metadata (matching Go: s.UnmarshalUserMetadata)
        try {
            return this.natsService.unmarshalUserMetadata(info.metadata);
        } catch (error) {
            this.logger.error(`Failed to unmarshal user metadata: ${error.message}`);
            return null;
        }
    }

    /**
     * GetUserWithMetadata retrieves user info along with parsed metadata
     * Equivalent to Go: s.GetUserWithMetadata (lines 191-201)
     * 
     * Returns null for both if user not found
     */
    async getUserWithMetadata(roomId: string, userId: string): Promise<{
        info: NatsKvUserInfo | null;
        metadata: any | null;
    }> {
        // Step 1: Get user info
        const info = await this.getUserInfo(roomId, userId);
        if (!info) {
            return { info: null, metadata: null };
        }

        // Step 2: Unmarshal metadata
        try {
            const metadata = this.natsService.unmarshalUserMetadata(info.metadata);
            return { info, metadata };
        } catch (error) {
            this.logger.error(`Failed to unmarshal user metadata: ${error.message}`);
            return { info: null, metadata: null };
        }
    }

    /**
     * GetUserLastPing retrieves last ping timestamp for a user
     * Equivalent to Go: s.GetUserLastPing (lines 205-218)
     * 
     * Returns 0 if user not found or timestamp cannot be parsed
     */
    async getUserLastPing(roomId: string, userId: string): Promise<number> {
        // Step 1: Try cache first (matching Go)
        const cachedVal = this.natsService.getCacheService().getUserLastPingAt(roomId, userId);
        if (cachedVal > 0) {
            return cachedVal;
        }

        // Step 2: Fallback to NATS
        try {
            const entry = await this.getUserKeyValue(roomId, userId, USER_LAST_PING_AT);
            if (!entry || !entry.value) {
                return 0;
            }

            // Step 3: Parse timestamp (matching Go: strconv.ParseInt)
            const value = new TextDecoder().decode(entry.value);
            const ts = parseInt(value, 10);
            return isNaN(ts) ? 0 : ts;
        } catch (error) {
            return 0;
        }
    }

    // ============================================================================
    // Private Helper Methods
    // ============================================================================

    private async getStringValue(kv: any, key: string): Promise<string> {
        try {
            const entry = await kv.get(key);
            if (!entry || !entry.value) {
                return '';
            }
            return new TextDecoder().decode(entry.value);
        } catch (error) {
            return '';
        }
    }

    private async getBoolValue(kv: any, key: string): Promise<boolean> {
        const value = await this.getStringValue(kv, key);
        return value === 'true';
    }

    private async getUint64Value(kv: any, key: string): Promise<string> {
        const value = await this.getStringValue(kv, key);
        const num = parseInt(value, 10);
        return isNaN(num) ? '0' : num.toString();
    }
}
