/**
 * NATS Cache Service
 *
 * In-memory cache for NATS KV data with real-time watchers
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { NatsKvRoomInfo } from '@workspace/protocol';
import { NatsKvRoomInfoSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';

/**
 * Cached room entry with watcher control
 */
interface CachedRoomEntry {
    roomInfo: NatsKvRoomInfo;
    stopSignal: AbortController; // For stopping watcher
}

/**
 * Cached room user status
 */
interface CachedRoomUserStatusEntry {
    status: string;
    revision: number;
}

/**
 * Cached user info
 */
interface CachedUserInfoEntry {
    userInfo: any; // NatsKvUserInfo
    lastPingAt: number;
}

/**
 * NatsCacheService - Singleton in-memory cache for NATS data
 *
 * Features:
 * - In-memory cache for room info
 * - Real-time NATS KV watchers
 * - Thread-safe with locks
 * - Auto-cleanup on room end
 */
@Injectable()
export class NatsCacheService implements OnModuleDestroy {
    private readonly logger = new Logger('NatsCacheService');

    // Global abort controller for all watchers
    private readonly globalAbortController = new AbortController();

    // Room info cache
    private readonly roomsInfoStore = new Map<string, CachedRoomEntry>();

    // User status cache
    private readonly roomUsersStatusStore = new Map<string, Map<string, CachedRoomUserStatusEntry>>();

    // User info cache
    private readonly roomUsersInfoStore = new Map<string, Map<string, CachedUserInfoEntry>>();

    constructor() {
        this.logger.log('NATS Cache Service initialized');
    }

    onModuleDestroy() {
        this.shutdown();
    }

    /**
     * Shutdown gracefully stops all watchers
     */
    shutdown(): void {
        this.logger.log('Shutting down NATS Cache Service...');
        this.globalAbortController.abort();
        this.roomsInfoStore.clear();
        this.roomUsersStatusStore.clear();
        this.roomUsersInfoStore.clear();
        this.logger.log('NATS Cache Service shutdown complete.');
    }

    // ============================================================================
    // Room Cache Methods
    // ============================================================================

    /**
     * AddRoomWatcher adds a watcher for the given roomId
     *
     * Each room has its own watcher for real-time updates
     */
    addRoomWatcher(kv: any, bucket: string, roomId: string): void {
        // Check if already watching
        if (this.roomsInfoStore.has(roomId)) {
            this.logger.debug(`Already watching room: ${roomId}`);
            return;
        }

        // Create stop signal for this watcher
        const stopSignal = new AbortController();

        // Initialize cache entry
        this.roomsInfoStore.set(roomId, {
            roomInfo: create(NatsKvRoomInfoSchema, {}),
            stopSignal,
        });

        this.logger.log(`NATS KV watcher for room started: ${roomId}, bucket: ${bucket}`);

        // Start NATS KV watcher
        // watchers return an async iterable
        kv.watch({
            includeHistory: true,
        }).then((watcher) => {
            this.startWatcherLoop(watcher, roomId, stopSignal);
        }).catch((err) => {
            this.logger.error(`Failed to start watcher for room ${roomId}: ${err.message}`);
            this.cleanRoomCache(roomId);
        });
    }

    /**
     * Start watcher loop
     */
    private async startWatcherLoop(watcher: any, roomId: string, stopSignal: AbortController): Promise<void> {
        try {
            for await (const entry of watcher) {
                if (stopSignal.signal.aborted || this.globalAbortController.signal.aborted) {
                    break;
                }
                if (entry) {
                    this.updateRoomCache(entry, roomId);
                }
            }
        } catch (error) {
            // Ignore error if it's due to abort
            if (!stopSignal.signal.aborted && !this.globalAbortController.signal.aborted) {
                this.logger.error(`Watcher error for room ${roomId}: ${error}`);
            }
        } finally {
            this.logger.log(`NATS KV watcher for room stopped: ${roomId}`);
            try {
                // Ensure watcher is stopped
                watcher.stop();
            } catch (e) {
                // ignore
            }
            this.cleanRoomCache(roomId);
        }
    }

    /**
     * Update room cache from NATS KV entry
     */
    private updateRoomCache(entry: any, roomId: string): void {
        const cachedEntry = this.roomsInfoStore.get(roomId);
        if (!cachedEntry) {
            // Entry was cleaned up
            return;
        }

        const val = entry.value.toString();
        const roomInfo = cachedEntry.roomInfo;

        // Update specific field based on key
        switch (entry.key) {
            case 'id':
                roomInfo.dbTableId = this.convertTextToUint64(val);
                break;
            case 'room_id':
                roomInfo.roomId = val;
                break;
            case 'room_sid':
                roomInfo.roomSid = val;
                break;
            case 'status':
                roomInfo.status = val;
                // Auto-cleanup if room ended
                if (val === 'ended') {
                    this.cleanRoomCache(roomId);
                    return;
                }
                break;
            case 'empty_timeout':
                roomInfo.emptyTimeout = this.convertTextToUint64(val);
                break;
            case 'max_participants':
                roomInfo.maxParticipants = this.convertTextToUint64(val);
                break;
            case 'created_at':
                roomInfo.createdAt = this.convertTextToUint64(val);
                break;
            case 'metadata':
                roomInfo.metadata = val;
                break;
        }

        // Force update
        this.roomsInfoStore.set(roomId, cachedEntry);
    }

    /**
     * GetCachedRoomInfo retrieves cached room info
     *
     * Returns deep copy to prevent mutation
     */
    getCachedRoomInfo(roomId: string): NatsKvRoomInfo | null {
        const cachedEntry = this.roomsInfoStore.get(roomId);
        if (!cachedEntry || !cachedEntry.roomInfo) {
            return null;
        }

        // Don't deliver cache if room ended
        if (cachedEntry.roomInfo.status === 'ended') {
            return null;
        }

        // Return deep copy
        return create(NatsKvRoomInfoSchema, {
            ...cachedEntry.roomInfo,
        });
    }

    /**
     * deleteRoomInfo manually removes room from cache and stops watcher
     */
    async deleteRoomInfo(roomId: string): Promise<void> {
        this.cleanRoomCache(roomId);
        this.cleanRoomUserStatusCache(roomId);
        this.roomUsersInfoStore.delete(roomId);
    }

    /**
     * Clean room cache
     */
    private cleanRoomCache(roomId: string): void {
        const entry = this.roomsInfoStore.get(roomId);
        if (entry) {
            // Signal watcher to stop
            entry.stopSignal.abort();
        }
        this.roomsInfoStore.delete(roomId);
        this.logger.debug(`Room cache cleaned: ${roomId}`);
    }

    // ============================================================================
    // User Cache Methods
    // ============================================================================

    /**
     * AddRoomUserStatusWatcher will start watching user status in a specific room
     *
     * Each room has only one RoomUsersBucket bucket
     * In this bucket userId is key and status is value
     */
    addRoomUserStatusWatcher(kv: any, bucket: string, roomId: string): void {
        // Check if already watching
        if (this.roomUsersStatusStore.has(roomId)) {
            this.logger.debug(`Already watching room user status: ${roomId}`);
            return;
        }

        // Initialize cache entry
        this.roomUsersStatusStore.set(roomId, new Map<string, CachedRoomUserStatusEntry>());

        this.logger.log(`NATS KV watcher for room user status started: ${roomId}, bucket: ${bucket}`);

        // Start NATS KV watcher with includeHistory
        const opts = { includeHistory: true };
        kv.watch(opts).then((watcher) => {
            this.startUserStatusWatcherLoop(watcher, roomId);
        }).catch((err) => {
            this.logger.error(`Failed to start user status watcher for room ${roomId}: ${err.message}`);
        });
    }

    /**
     * Start user status watcher loop
     */
    private async startUserStatusWatcherLoop(watcher: any, roomId: string): Promise<void> {
        try {
            for await (const entry of watcher) {
                if (this.globalAbortController.signal.aborted) {
                    break;
                }
                if (entry) {
                    // userId is key, status is value
                    const userId = entry.key;
                    // If value is null, it means it's a delete operation (though watch usually returns entry with operations)
                    if (entry.operation === 'DEL' || entry.operation === 'PURGE') {
                        // Handle delete if necessary, just updating status
                        // For now we assume we just update or set status
                        const statusStore = this.roomUsersStatusStore.get(roomId);
                        if (statusStore) {
                            statusStore.delete(userId);
                        }
                        continue;
                    }

                    if (entry.value) {
                        const status = new TextDecoder().decode(entry.value);
                        const statusStore = this.roomUsersStatusStore.get(roomId);
                        if (statusStore) {
                            statusStore.set(userId, {
                                status,
                                revision: entry.revision,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            if (!this.globalAbortController.signal.aborted) {
                this.logger.error(`User status watcher error for room ${roomId}: ${error}`);
            }
        } finally {
            this.logger.log(`NATS KV watcher for room user status stopped: ${roomId}`);
            try {
                watcher.stop();
            } catch (e) {
                // ignore
            }
            this.cleanRoomUserStatusCache(roomId);
        }
    }

    /**
     * GetCachedRoomUserStatus retrieves user status from cache
     */
    getCachedRoomUserStatus(roomId: string, userId: string): { status: string; revision: number } | null {
        const roomStore = this.roomUsersStatusStore.get(roomId);
        if (roomStore) {
            const entry = roomStore.get(userId);
            if (entry) {
                return { status: entry.status, revision: entry.revision };
            }
        }
        return null;
    }

    /**
     * GetUsersIdFromRoomStatusBucket retrieves all userIds from room status bucket
     */
    getUsersIdFromRoomStatusBucket(roomId: string, filterStatus: string = ''): string[] {
        const usersIds: string[] = [];
        const roomStore = this.roomUsersStatusStore.get(roomId);

        if (roomStore) {
            for (const [userId, entry] of roomStore) {
                if (filterStatus && entry.status === filterStatus) {
                    usersIds.push(userId);
                } else if (!filterStatus) {
                    // If no filter, return all users
                    usersIds.push(userId);
                }
            }
        }

        return usersIds;
    }

    /**
     * Clean room user status cache
     */
    private cleanRoomUserStatusCache(roomId: string): void {
        this.roomUsersStatusStore.delete(roomId);
        this.logger.debug(`Room user status cache cleaned: ${roomId}`);
    }

    /**
     * AddUserInfoWatcher will start watching user info
     *
     * Each user has its own bucket, so watch should be for each userId
     */
    addUserInfoWatcher(kv: any, bucket: string, roomId: string, userId: string): void {
        // Get or create room store
        let roomStore = this.roomUsersInfoStore.get(roomId);
        if (!roomStore) {
            roomStore = new Map<string, CachedUserInfoEntry>();
            this.roomUsersInfoStore.set(roomId, roomStore);
        }

        // Check if already watching
        if (roomStore.has(userId)) {
            this.logger.debug(`Already watching user info: room=${roomId}, user=${userId}`);
            return;
        }

        // Initialize cache entry
        roomStore.set(userId, {
            userInfo: null, // Will be populated by watcher
            lastPingAt: 0,
        });

        this.logger.log(`NATS KV watcher for user started: room=${roomId}, user=${userId}, bucket=${bucket}`);

        // Start NATS KV watcher with includeHistory
        const opts = { includeHistory: true };
        kv.watch(opts).then((watcher) => {
            this.startUserInfoWatcherLoop(watcher, roomId, userId);
        }).catch((err) => {
            this.logger.error(`Failed to start user info watcher for user ${userId}: ${err.message}`);
            this.cleanUserInfoCache(roomId, userId);
        });
    }

    /**
     * Start user info watcher loop
     */
    private async startUserInfoWatcherLoop(watcher: any, roomId: string, userId: string): Promise<void> {
        try {
            for await (const entry of watcher) {
                if (this.globalAbortController.signal.aborted) {
                    break;
                }
                if (entry) {
                    if (entry.operation === 'DEL' || entry.operation === 'PURGE') {
                        // If the whole bucket/key is deleted? 
                        // Actually in KV, watch returns all keys. We might want to filter?
                        // But here we are assuming the bucket IS the user info bucket which contains multiple keys for one user?
                        //  "Each user has its own bucket".
                        // So 'key' is field name (id, name, etc).
                        continue;
                    }
                    if (entry.value && entry.value.length > 0) {
                        this.updateUserInfoCache(entry, roomId, userId);
                    }
                }
            }
        } catch (error) {
            if (!this.globalAbortController.signal.aborted) {
                this.logger.error(`User info watcher error for user ${userId} in room ${roomId}: ${error}`);
            }
        } finally {
            this.logger.log(`NATS KV watcher for user info stopped: room=${roomId}, user=${userId}`);
            try {
                watcher.stop();
            } catch (e) {
                // ignore
            }
            this.cleanUserInfoCache(roomId, userId);
        }
    }

    /**
     * Update user info cache from NATS KV entry
     */
    private updateUserInfoCache(entry: any, roomId: string, userId: string): void {
        const roomStore = this.roomUsersInfoStore.get(roomId);
        if (!roomStore) return;

        const cachedEntry = roomStore.get(userId);
        if (!cachedEntry) return;

        // Initialize userInfo if null
        if (!cachedEntry.userInfo) {
            cachedEntry.userInfo = {};
        }

        const val = new TextDecoder().decode(entry.value);
        const userInfo = cachedEntry.userInfo;

        // Update specific field based on key
        switch (entry.key) {
            case 'id':
                userInfo.userId = val;
                break;
            case 'sid':
                userInfo.userSid = val;
                break;
            case 'name':
                userInfo.name = val;
                break;
            case 'room_id':
                userInfo.roomId = val;
                break;
            case 'metadata':
                userInfo.metadata = val;
                break;
            case 'is_admin':
                userInfo.isAdmin = val === 'true';
                break;
            case 'is_presenter':
                userInfo.isPresenter = val === 'true';
                break;
            case 'joined_at':
                userInfo.joinedAt = this.convertTextToUint64(val);
                break;
            case 'reconnected_at':
                userInfo.reconnectedAt = this.convertTextToUint64(val);
                break;
            case 'disconnected_at':
                userInfo.disconnectedAt = this.convertTextToUint64(val);
                break;
            case 'last_ping_at':
                cachedEntry.lastPingAt = parseInt(this.convertTextToUint64(val), 10);
                break;
        }

        // Force push updated data
        roomStore.set(userId, cachedEntry);
    }

    /**
     * GetUserInfo retrieves cached user info
     *
     * Returns deep copy to prevent mutation
     */
    getUserInfo(roomId: string, userId: string): any | null {
        const roomStore = this.roomUsersInfoStore.get(roomId);
        if (roomStore) {
            const entry = roomStore.get(userId);
            if (entry && entry.userInfo) {
                // Return deep copy
                return { ...entry.userInfo };
            }
        }
        return null;
    }

    /**
     * GetUserLastPingAt retrieves user's last ping timestamp
     */
    getUserLastPingAt(roomId: string, userId: string): number {
        const roomStore = this.roomUsersInfoStore.get(roomId);
        if (roomStore) {
            const entry = roomStore.get(userId);
            if (entry) {
                return entry.lastPingAt;
            }
        }
        return 0;
    }

    /**
     * Clean user info cache
     */
    private cleanUserInfoCache(roomId: string, userId: string): void {
        const roomStore = this.roomUsersInfoStore.get(roomId);
        if (roomStore) {
            roomStore.delete(userId);
            this.logger.debug(`User info cache cleaned: room=${roomId}, user=${userId}`);
        }
    }

    // ============================================================================
    // Helper methods
    // ============================================================================

    /**
     * Convert text to uint64 (as string in protobuf)
     */
    private convertTextToUint64(text: string): string {
        const value = parseInt(text, 10);
        return isNaN(value) ? '0' : value.toString();
    }

    // ============================================================================
    // Stats & Debugging
    // ============================================================================

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            roomsCount: this.roomsInfoStore.size,
            usersStatusCount: this.roomUsersStatusStore.size,
            usersInfoCount: this.roomUsersInfoStore.size,
        };
    }
}
