/**
 * NATS Room Service
 *
 * Handles NATS KV operations for room information and modification
 */

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RoomMetadata, NatsKvRoomInfo } from '@workspace/protocol';
import { NatsKvRoomInfoSchema, RoomMetadataSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { NatsService } from './nats.service';
import { NatsStreamService } from './nats-stream.service';
import { NatsUserService } from './nats-user.service';

// Constants
const NATS_PREFIX = 'wajlc-';  // Must use dash, not colon! NATS bucket names cannot contain ':'
const ROOM_INFO_BUCKET_PREFIX = `${NATS_PREFIX}roomInfo-`;
const ROOM_INFO_BUCKET = `${ROOM_INFO_BUCKET_PREFIX}%s`;
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Room KV keys
const ROOM_DB_TABLE_ID_KEY = 'id';
const ROOM_ID_KEY = 'room_id';
const ROOM_SID_KEY = 'room_sid';
const ROOM_EMPTY_TIMEOUT_KEY = 'empty_timeout';
const ROOM_MAX_PARTICIPANTS = 'max_participants';
const ROOM_STATUS_KEY = 'status';
const ROOM_METADATA_KEY = 'metadata';
const ROOM_CREATED_KEY = 'created_at';

// Room files bucket and keys
const ROOM_FILES_BUCKET_PREFIX = `${NATS_PREFIX}roomFiles-`;
const ROOM_FILES_BUCKET = `${ROOM_FILES_BUCKET_PREFIX}%s`;

// Breakout rooms bucket
const BREAKOUT_ROOMS_BUCKET_PREFIX = `${NATS_PREFIX}breakoutRooms-`;
const BREAKOUT_ROOMS_BUCKET = `${BREAKOUT_ROOMS_BUCKET_PREFIX}%s`;

// Etherpad keys
const ETHERPAD_TOKEN_KEY = `${NATS_PREFIX}etherpadToken-%s`;
const ETHERPAD_ROOMS_KEY = `${NATS_PREFIX}etherpadRooms-%s`;

// Room status constants
export const ROOM_STATUS_CREATED = 'created';
export const ROOM_STATUS_ACTIVE = 'active';
export const ROOM_STATUS_ENDED = 'ended';

/**
 * NatsRoomService handles NATS KV operations for rooms
 */
@Injectable()
export class NatsRoomService {
    private readonly logger = new Logger(NatsRoomService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly natsService: NatsService,  // Inject base NATS service
        private readonly natsStreamService: NatsStreamService,  // Inject stream service
        @Inject(forwardRef(() => NatsUserService)) private readonly natsUserService: NatsUserService,  // Inject user service
    ) { }

    /**
     * GetRoomInfo retrieves room information from NATS KV
     */
    async getRoomInfo(roomId: string): Promise<NatsKvRoomInfo | null> {
        this.logger.log(`Getting room info for: ${roomId}`);

        // Step 1: Try to get cached room info first
        const cached = this.natsService.getCacheService().getCachedRoomInfo(roomId);
        if (cached) {
            this.logger.debug(`Room info retrieved from cache: ${roomId}`);
            return cached;
        }

        // Step 2: Cache miss - read from NATS KV
        const bucket = ROOM_INFO_BUCKET.replace('%s', roomId);

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);

            // Create room info object
            const info = create(NatsKvRoomInfoSchema, {
                dbTableId: await this.getUint64Value(kv, ROOM_DB_TABLE_ID_KEY),
                roomId: await this.getStringValue(kv, ROOM_ID_KEY),
                roomSid: await this.getStringValue(kv, ROOM_SID_KEY),
                status: await this.getStringValue(kv, ROOM_STATUS_KEY),
                emptyTimeout: await this.getUint64Value(kv, ROOM_EMPTY_TIMEOUT_KEY),
                maxParticipants: await this.getUint64Value(kv, ROOM_MAX_PARTICIPANTS),
                createdAt: await this.getUint64Value(kv, ROOM_CREATED_KEY),
                metadata: await this.getStringValue(kv, ROOM_METADATA_KEY),
            });

            // Step 3: Add watcher if room not ended
            if (info.status !== ROOM_STATUS_ENDED) {
                this.natsService.getCacheService().addRoomWatcher(kv, bucket, roomId);
            }

            this.logger.log(`Room info retrieved from NATS: ${roomId}`);
            return info;
        } catch (error) {
            this.logger.error(`Error getting room info for ${roomId}: ${error.message}`);
            return null;
        }
    }

    /**
     * GetActiveRooms retrieves all currently active rooms by scanning KV buckets
     */
    async getActiveRooms(): Promise<{ roomId: string }[]> {
        const jsm = this.natsService.getJetStreamManager();
        const activeRooms: { roomId: string }[] = [];

        try {
            // NATS KV buckets are mirrored as streams with "KV_" prefix
            // We search for streams starting with KV_<ROOM_INFO_BUCKET_PREFIX>
            const streamPrefix = `KV_${ROOM_INFO_BUCKET_PREFIX}`;

            // Getting all streams might be heavy if thousands of rooms, 
            // but necessary if no central index.
            // Paging might be required for production scaling.
            const streams = await jsm.streams.list();

            for await (const stream of streams) {
                if (stream.config.name.startsWith(streamPrefix)) {
                    // Extract Room ID: KV_wajlc-roomInfo-<roomId>
                    const roomId = stream.config.name.substring(streamPrefix.length);
                    activeRooms.push({ roomId });
                }
            }
        } catch (error) {
            this.logger.error(`Error getting active rooms: ${error.message}`);
        }

        return activeRooms;
    }

    /**
     * GetRoomInfoWithMetadata retrieves room info along with parsed metadata
     */
    async getRoomInfoWithMetadata(roomId: string): Promise<{ info: NatsKvRoomInfo | null; metadata: RoomMetadata | null }> {
        const info = await this.getRoomInfo(roomId);
        if (!info) {
            return { info: null, metadata: null };
        }

        const metadata = this.natsService.unmarshalRoomMetadata(info.metadata);
        return { info, metadata };
    }

    /**
     * GetRoomMetadataStruct retrieves only the metadata structure
     */
    async getRoomMetadataStruct(roomId: string): Promise<RoomMetadata | null> {
        const info = await this.getRoomInfo(roomId);
        if (!info || !info.metadata) {
            return null;
        }

        return this.natsService.unmarshalRoomMetadata(info.metadata);
    }

    /**
     * AddRoom creates a new room entry in NATS KV
     *
     * Steps:
     * 1. Create or update the key-value bucket for the room
     * 2. Set default values if not provided
     * 3. Marshal metadata to string
     * 4. Prepare room data map
     * 5. Store each key-value pair
     * 6. Add room to watcher
     */
    async addRoom(
        tableId: number,
        roomId: string,
        roomSid: string,
        emptyTimeout?: number,
        maxParticipants?: number,
        metadata?: RoomMetadata,
    ): Promise<void> {
        this.logger.log(`Adding room to NATS KV: ${roomId}, sid: ${roomSid}, tableId: ${tableId}`);

        // Step 1: Create or update the key-value bucket for the room
        const bucket = ROOM_INFO_BUCKET.replace('%s', roomId);
        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;

        const js = this.natsService.getJetStream();
        const kv = await js.views.kv(bucket, {
            history: 1,
            ttl: DEFAULT_TTL,
            replicas: numReplicas,
        });

        // Step 2: Set default values if not provided
        const timeout = emptyTimeout ?? 1800; // 30 minutes
        const maxPart = maxParticipants ?? 0; // 0 = unlimited

        // Step 3: Marshal metadata to string
        const mt = this.natsService.marshalRoomMetadata(metadata || create(RoomMetadataSchema, {}));

        // Step 4: Prepare room data
        const data: Record<string, string> = {
            [ROOM_DB_TABLE_ID_KEY]: tableId.toString(),
            [ROOM_ID_KEY]: roomId,
            [ROOM_SID_KEY]: roomSid,
            [ROOM_EMPTY_TIMEOUT_KEY]: timeout.toString(),
            [ROOM_MAX_PARTICIPANTS]: maxPart.toString(),
            [ROOM_STATUS_KEY]: ROOM_STATUS_CREATED,
            [ROOM_CREATED_KEY]: Math.floor(Date.now() / 1000).toString(), // Unix timestamp
            [ROOM_METADATA_KEY]: mt,
        };

        // Step 5: Store each key-value pair
        for (const [key, value] of Object.entries(data)) {
            await kv.put(key, new TextEncoder().encode(value));
        }

        // Step 6: Add room to watcher
        this.natsService.getCacheService().addRoomWatcher(kv, bucket, roomId);

        this.logger.log(`Room added to NATS KV successfully: ${roomId}`);
    }

    /**
     * UpdateRoomStatus changes room status
     */
    async updateRoomStatus(roomId: string, status: string): Promise<void> {
        this.logger.log(`Updating room status: ${roomId} -> ${status}`);

        const bucket = ROOM_INFO_BUCKET.replace('%s', roomId);

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);

            await kv.put(ROOM_STATUS_KEY, new TextEncoder().encode(status));

            this.logger.log(`Room status updated successfully: ${roomId}`);
        } catch (error) {
            throw new Error(`Failed to update room status: ${error.message}`);
        }
    }

    /**
     * UpdateRoomMetadata updates room metadata

     */
    async updateRoomMetadata(roomId: string, metadata: RoomMetadata | string): Promise<string> {
        let mt: RoomMetadata;

        // Handle different input types 
        if (typeof metadata === 'string') {
            mt = this.natsService.unmarshalRoomMetadata(metadata);
        } else {
            mt = metadata;
        }

        const bucket = ROOM_INFO_BUCKET.replace('%s', roomId);

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);

            const ml = this.natsService.marshalRoomMetadata(mt);
            await kv.put(ROOM_METADATA_KEY, new TextEncoder().encode(ml));

            return ml;
        } catch (error) {
            throw new Error(`Failed to update metadata: ${error.message}`);
        }
    }

    /**
     * DeleteRoom removes room KV bucket

     */
    async deleteRoom(roomId: string): Promise<void> {
        this.logger.log(`Deleting room from NATS KV: ${roomId}`);

        const bucket = ROOM_INFO_BUCKET.replace('%s', roomId);

        try {
            const jsm = this.natsService.getJetStreamManager();
            const streamName = `KV_${bucket}`;
            await jsm.streams.delete(streamName);

            this.logger.log(`Room deleted from NATS KV: ${roomId}`);
        } catch (error) {
            // Ignore if already deleted 
            if (error.message && error.message.includes('stream not found')) {
                this.logger.debug(`Room KV already deleted: ${roomId}`);
                return;
            }
            throw error;
        }
    }

    /**
     * OnAfterSessionEndCleanup performs cleanup after session ends

     */
    async onAfterSessionEndCleanup(roomId: string): Promise<void> {
        this.logger.log(`Performing session end cleanup for room: ${roomId}`);

        // Silently delete everything
        try {
            // 1. Delete breakout rooms
            try {
                await this.deleteAllBreakoutRoomsByParentRoomId(roomId);
            } catch (e) { }

            // 2. Delete all room users and their consumers
            try {
                await this.natsUserService.deleteAllRoomUsersWithConsumer(roomId);
            } catch (e) { }

            // 3. Delete room's dedicated NATS stream
            try {
                await this.natsStreamService.deleteRoomNatsStream(roomId);
            } catch (e) { }

            // 4. Delete all room files metadata bucket
            try {
                await this.deleteAllRoomFiles(roomId);
            } catch (e) { }

            // 5. Final NATS KV cleanup (room info, user buckets, block list, etc.)
            await this.natsService.onAfterSessionEndCleanup(roomId);

        } catch (error) {
            this.logger.error(`Error during session end cleanup for room ${roomId}: ${error.message}`);
        }

        this.logger.log(`Session end cleanup completed for room: ${roomId}`);
    }

    /**
     * AddRoomFile adds or updates a file's metadata in the room's file bucket.
     * The fileId will be used as the key.
     */
    async addRoomFile(roomId: string, meta: any): Promise<void> {
        this.logger.log(`Adding room file metadata for: ${roomId}, fileId: ${meta.fileId}`);

        const bucket = ROOM_FILES_BUCKET.replace('%s', roomId);
        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket, {
                history: 1,
                ttl: DEFAULT_TTL,
                replicas: numReplicas,
            });

            const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
            await kv.put(meta.fileId, metaBytes);

            this.logger.log(`Room file metadata added successfully: ${roomId}, fileId: ${meta.fileId}`);
        } catch (error) {
            this.logger.error(`Error adding room file metadata for ${roomId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * DeleteRoomFile removes a file's metadata from the room's file bucket.
     */
    async deleteRoomFile(roomId: string, fileId: string): Promise<void> {
        this.logger.log(`Deleting room file metadata for: ${roomId}, fileId: ${fileId}`);

        const bucket = ROOM_FILES_BUCKET.replace('%s', roomId);

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            await kv.purge(fileId);

            this.logger.log(`Room file metadata deleted: ${roomId}, fileId: ${fileId}`);
        } catch (error) {
            // Ignore if bucket doesn't exist
            if (error.message && (error.message.includes('bucket not found') || error.message.includes('stream not found'))) {
                return;
            }
            this.logger.error(`Error deleting room file metadata for ${roomId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * GetRoomFile retrieves a specific file's metadata.
     */
    async getRoomFile(roomId: string, fileId: string): Promise<any | null> {
        const bucket = ROOM_FILES_BUCKET.replace('%s', roomId);

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const entry = await kv.get(fileId);

            if (!entry || !entry.value) {
                return null;
            }

            return JSON.parse(new TextDecoder().decode(entry.value));
        } catch (error) {
            // Return null if key or bucket not found
            return null;
        }
    }

    /**
     * GetAllRoomFiles retrieves all file metadata for a given room.
     */
    async getAllRoomFiles(roomId: string): Promise<Record<string, any>> {
        const bucket = ROOM_FILES_BUCKET.replace('%s', roomId);
        const result: Record<string, any> = {};

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const keys = await kv.keys();

            for await (const k of keys) {
                const entry = await kv.get(k);
                if (entry && entry.value) {
                    try {
                        result[k] = JSON.parse(new TextDecoder().decode(entry.value));
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }

            return result;
        } catch (error) {
            // Return empty if bucket not found
            return result;
        }
    }

    /**
     * DeleteAllRoomFiles purges the entire file bucket for a room.
     */
    async deleteAllRoomFiles(roomId: string): Promise<void> {
        this.logger.log(`Deleting all room files for: ${roomId}`);
        const bucket = ROOM_FILES_BUCKET.replace('%s', roomId);

        try {
            const jsm = this.natsService.getJetStreamManager();
            const streamName = `KV_${bucket}`;
            await jsm.streams.delete(streamName);
        } catch (error) {
            // Ignore if already deleted
        }
    }

    // ============================================================================
    // Breakout Rooms Methods
    // ============================================================================

    /**
     * InsertOrUpdateBreakoutRoom adds or updates a breakout room in the parent room's breakout rooms bucket.
     */
    async insertOrUpdateBreakoutRoom(parentRoomId: string, breakoutRoomId: string, data: Uint8Array): Promise<void> {
        this.logger.log(`Inserting/Updating breakout room: parent=${parentRoomId}, breakout=${breakoutRoomId}`);
        const bucket = BREAKOUT_ROOMS_BUCKET.replace('%s', parentRoomId);
        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket, {
                history: 1,
                ttl: DEFAULT_TTL,
                replicas: numReplicas,
            });
            await kv.put(breakoutRoomId, data);
        } catch (error) {
            this.logger.error(`Error updating breakout room for ${parentRoomId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * GetBreakoutRoom retrieves a specific breakout room's info.
     */
    async getBreakoutRoom(parentRoomId: string, breakoutRoomId: string): Promise<Uint8Array | null> {
        const bucket = BREAKOUT_ROOMS_BUCKET.replace('%s', parentRoomId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const entry = await kv.get(breakoutRoomId);
            return entry?.value ?? null;
        } catch (error) {
            return null;
        }
    }

    /**
     * GetAllBreakoutRoomsByParentRoomId retrieves all breakout rooms for a parent room.
     */
    async getAllBreakoutRoomsByParentRoomId(parentRoomId: string): Promise<Record<string, Uint8Array>> {
        const bucket = BREAKOUT_ROOMS_BUCKET.replace('%s', parentRoomId);
        const result: Record<string, Uint8Array> = {};
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const keys = await kv.keys();
            for await (const k of keys) {
                const entry = await kv.get(k);
                if (entry && entry.value) {
                    result[k] = entry.value;
                }
            }
        } catch (error) { }
        return result;
    }

    /**
     * GetBreakoutRoomIdsByParentRoomId retrieves only the IDs of breakout rooms.
     */
    async getBreakoutRoomIdsByParentRoomId(parentRoomId: string): Promise<string[]> {
        const bucket = BREAKOUT_ROOMS_BUCKET.replace('%s', parentRoomId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const keys = await kv.keys();
            const ids: string[] = [];
            for await (const k of keys) {
                ids.push(k);
            }
            return ids;
        } catch (error) {
            return [];
        }
    }

    /**
     * DeleteBreakoutRoom removes a specific breakout room from parent's list.
     */
    async deleteBreakoutRoom(parentRoomId: string, breakoutRoomId: string): Promise<void> {
        const bucket = BREAKOUT_ROOMS_BUCKET.replace('%s', parentRoomId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            await kv.purge(breakoutRoomId);
        } catch (error) { }
    }

    /**
     * DeleteAllBreakoutRoomsByParentRoomId deletes the entire breakout rooms bucket.
     */
    async deleteAllBreakoutRoomsByParentRoomId(parentRoomId: string): Promise<void> {
        const bucket = BREAKOUT_ROOMS_BUCKET.replace('%s', parentRoomId);
        try {
            const jsm = this.natsService.getJetStreamManager();
            const streamName = `KV_${bucket}`;
            await jsm.streams.delete(streamName);
        } catch (error) { }
    }

    /**
     * CountBreakoutRooms counts how many breakout rooms a parent room has.
     */
    async countBreakoutRooms(parentRoomId: string): Promise<number> {
        const bucket = BREAKOUT_ROOMS_BUCKET.replace('%s', parentRoomId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const keys = await kv.keys();
            let count = 0;
            for await (const _ of keys) {
                count++;
            }
            return count;
        } catch (error) {
            return 0;
        }
    }

    // ============================================================================
    // Etherpad Tokens and Rooms Management
    // ============================================================================

    /**
     * AddEtherpadToken stores an access token for an etherpad node.
     */
    async addEtherpadToken(nodeId: string, token: string, ttlMs: number): Promise<void> {
        const bucket = ETHERPAD_TOKEN_KEY.replace('%s', nodeId);
        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket, {
                history: 1,
                ttl: ttlMs,
                replicas: numReplicas,
            });
            await kv.put(nodeId, new TextEncoder().encode(token));
        } catch (error) {
            this.logger.error(`Error adding etherpad token: ${error.message}`);
            throw error;
        }
    }

    /**
     * GetEtherpadToken retrieves a cached access token for an etherpad node.
     */
    async getEtherpadToken(nodeId: string): Promise<string> {
        const bucket = ETHERPAD_TOKEN_KEY.replace('%s', nodeId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const entry = await kv.get(nodeId);
            return entry?.value ? new TextDecoder().decode(entry.value) : '';
        } catch (error) {
            return '';
        }
    }

    /**
     * AddRoomInEtherpad marks a room as active on a specific etherpad node.
     */
    async addRoomInEtherpad(nodeId: string, roomId: string): Promise<void> {
        const bucket = ETHERPAD_ROOMS_KEY.replace('%s', nodeId);
        const numReplicas = this.configService.get<number>('NATS_NUM_REPLICAS') || 1;

        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket, {
                history: 1,
                ttl: DEFAULT_TTL,
                replicas: numReplicas,
            });
            await kv.put(roomId, new TextEncoder().encode(Date.now().toString()));
        } catch (error) {
            this.logger.error(`Error adding room to etherpad node ${nodeId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * GetEtherpadActiveRoomsNum returns the number of active rooms on an etherpad node.
     */
    async getEtherpadActiveRoomsNum(nodeId: string): Promise<number> {
        const bucket = ETHERPAD_ROOMS_KEY.replace('%s', nodeId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            const status = await kv.status();
            return Number(status.values);
        } catch (error) {
            return 0;
        }
    }

    /**
     * RemoveRoomFromEtherpad unmarks a room as active on an etherpad node.
     */
    async removeRoomFromEtherpad(nodeId: string, roomId: string): Promise<void> {
        const bucket = ETHERPAD_ROOMS_KEY.replace('%s', nodeId);
        try {
            const js = this.natsService.getJetStream();
            const kv = await js.views.kv(bucket);
            await kv.purge(roomId);
        } catch (error) { }
    }

    // ============================================================================
    // Helper methods for KV access
    // ============================================================================

    /**
     * Get string value from KV
     */
    private async getStringValue(kv: any, key: string): Promise<string> {
        try {
            const entry = await kv.get(key);
            return entry?.value ? new TextDecoder().decode(entry.value) : '';
        } catch (error) {
            return '';
        }
    }

    /**
     * Get uint64 value from KV (returns as string in protobuf)
     */
    private async getUint64Value(kv: any, key: string): Promise<string> {
        try {
            const entry = await kv.get(key);
            return entry?.value ? new TextDecoder().decode(entry.value) : '0';
        } catch (error) {
            return '0';
        }
    }
}
