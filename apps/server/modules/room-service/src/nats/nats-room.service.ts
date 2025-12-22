/**
 * NATS Room Service
 * Equivalent to Go: plugNmeet-server/pkg/services/nats/room_info.go + room_modify.go
 * 
 * Handles NATS KV operations for room information and modification
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RoomMetadata, NatsKvRoomInfo } from '@workspace/protocol';
import { NatsKvRoomInfoSchema, RoomMetadataSchema } from '@workspace/protocol';
import { create } from '@bufbuild/protobuf';
import { NatsService } from './nats.service';
import { NatsStreamService } from './nats-stream.service';
import { NatsUserService } from './nats-user.service';

// Constants matching Go
const NATS_PREFIX = 'pnm:';
const ROOM_INFO_BUCKET_PREFIX = `${NATS_PREFIX}roomInfo-`;
const ROOM_INFO_BUCKET = `${ROOM_INFO_BUCKET_PREFIX}%s`;
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 * 1000000; // 7 days in nanoseconds

// Room KV keys
const ROOM_DB_TABLE_ID_KEY = 'id';
const ROOM_ID_KEY = 'room_id';
const ROOM_SID_KEY = 'room_sid';
const ROOM_EMPTY_TIMEOUT_KEY = 'empty_timeout';
const ROOM_MAX_PARTICIPANTS = 'max_participants';
const ROOM_STATUS_KEY = 'status';
const ROOM_METADATA_KEY = 'metadata';
const ROOM_CREATED_KEY = 'created_at';

// Room status constants
export const ROOM_STATUS_CREATED = 'created';
export const ROOM_STATUS_ACTIVE = 'active';
export const ROOM_STATUS_ENDED = 'ended';

/**
 * NatsRoomService handles NATS KV operations for rooms
 * Equivalent to Go: NatsService (room_info.go + room_modify.go)
 */
@Injectable()
export class NatsRoomService {
    private readonly logger = new Logger(NatsRoomService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly natsService: NatsService,  // Inject base NATS service
        private readonly natsStreamService: NatsStreamService,  // Inject stream service
        private readonly natsUserService: NatsUserService,  // Inject user service
    ) { }

    /**
     * GetRoomInfo retrieves room information from NATS KV
     * Equivalent to Go: s.GetRoomInfo
     */
    async getRoomInfo(roomId: string): Promise<NatsKvRoomInfo | null> {
        this.logger.log(`Getting room info for: ${roomId}`);

        // Step 1: Try to get cached room info first (matching Go)
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

            // Step 3: Add watcher if room not ended (matching Go)
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
     * GetRoomInfoWithMetadata retrieves room info along with parsed metadata
     * Equivalent to Go: s.GetRoomInfoWithMetadata
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
     * Equivalent to Go: s.GetRoomMetadataStruct
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
     * Equivalent to Go: s.AddRoom
     * 
     * Steps (matching Go exactly):
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
     * Equivalent to Go: s.UpdateRoomStatus
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
     * Equivalent to Go: s.updateRoomMetadata
     */
    async updateRoomMetadata(roomId: string, metadata: RoomMetadata | string): Promise<string> {
        let mt: RoomMetadata;

        // Handle different input types (matching Go's type switch)
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
     * Equivalent to Go: s.DeleteRoom
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
            // Ignore if already deleted (matching Go behavior)
            if (error.message && error.message.includes('stream not found')) {
                this.logger.debug(`Room KV already deleted: ${roomId}`);
                return;
            }
            throw error;
        }
    }

    /**
     * OnAfterSessionEndCleanup performs cleanup after session ends
     * Equivalent to Go: s.OnAfterSessionEndCleanup
     */
    async onAfterSessionEndCleanup(roomId: string): Promise<void> {
        this.logger.log(`Performing session end cleanup for room: ${roomId}`);

        // Silently delete everything (matching Go: no error logging)
        try {
            await this.deleteRoom(roomId);
            await this.natsUserService.deleteAllRoomUsersWithConsumer(roomId);
            await this.natsStreamService.deleteRoomNatsStream(roomId);
            // TODO: await this.deleteAllRoomFiles(roomId);
        } catch (error) {
            // Silently ignore errors (matching Go behavior)
        }

        this.logger.log(`Session end cleanup completed for room: ${roomId}`);
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
