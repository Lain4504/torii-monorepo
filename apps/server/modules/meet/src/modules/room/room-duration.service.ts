/**
 * Room Duration Service
 *
 * Handles room duration management and tracking
 */

import { Injectable, Logger } from '@nestjs/common';
import type { RoomMetadata } from '@workspace/protocol';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import { RedisRoomService } from '../../infrastructure/redis/redis-room.service';

/**
 * Room duration information structure
 */
export interface RoomDurationInfo {
    duration: number;   // Duration in minutes
    startedAt: number;  // Unix timestamp
}

/**
 * RoomDurationService handles room duration operations
 */
@Injectable()
export class RoomDurationService {
    private readonly logger = new Logger(RoomDurationService.name);

    constructor(
        private readonly natsRoomService: NatsRoomService,
        private readonly natsRoomEvents: NatsRoomEventsService,
        private readonly redisRoom: RedisRoomService,
    ) { }

    /**
     * AddRoomWithDurationInfo adds room with duration info to tracking
     *
     * @param roomId - Room ID
     * @param info - Duration information
     */
    async addRoomWithDurationInfo(roomId: string, r: RoomDurationInfo): Promise<void> {
        this.logger.log(`Adding room with duration info: ${roomId}`);

        // Use Redis service to store duration info
        await this.redisRoom.addRoomWithDurationInfo(roomId, r);

        this.logger.log(`Successfully added room with duration info: ${roomId}`);
    }

    /**
     * DeleteRoomWithDuration removes room from duration tracking

     * 
     * @param roomId - Room ID to remove
     */
    async deleteRoomWithDuration(roomId: string): Promise<void> {
        this.logger.log(`Deleting room with duration: ${roomId}`);

        // Use Redis service to delete duration info
        await this.redisRoom.deleteRoomWithDuration(roomId);

        this.logger.log(`Successfully deleted room with duration: ${roomId}`);
    }

    /**
     * GetRoomsWithDurationMap retrieves all rooms with duration info
     * @returns Map of roomId to RoomDurationInfo
     */
    async getRoomsWithDurationMap(): Promise<Record<string, RoomDurationInfo>> {
        const keys = await this.redisRoom.getRoomsWithDurationKeys();
        const out: Record<string, RoomDurationInfo> = {};

        // This prefix matches REDIS_PREFIX + 'roomWithDurationInfo:' in redis-room.service.ts
        // wajlc:roomWithDurationInfo:
        const keyPrefix = 'wajlc:roomWithDurationInfo:';

        for (const key of keys) {
            const val = await this.redisRoom.getRoomWithDurationInfoByKey(key);
            if (!val) {
                continue;
            }

            // Extract roomId from key
            const roomId = key.replace(keyPrefix, '');
            out[roomId] = val;
        }

        return out;
    }

    /**
     * GetRoomDurationInfo retrieves duration info for a room
     * Used by IncreaseRoomDuration and CompareDurationWithParentRoom
     * 
     * @param roomId - Room ID
     * @returns RoomDurationInfo or null if not found
     */
    async getRoomDurationInfo(roomId: string): Promise<RoomDurationInfo | null> {
        this.logger.debug(`Getting room duration info: ${roomId}`);

        // Use Redis service to retrieve duration info
        return await this.redisRoom.getRoomWithDurationInfo(roomId);
    }

    /**
     * IncreaseRoomDuration increases the duration limit for a room

     * 
     * Complex logic:
     * 1. Get current room duration info from Redis
     * 2. Get room metadata from NATS
     * 3. Check if breakout room - validate against parent room duration
     * 4. Update duration in Redis
     * 5. Update and broadcast room metadata via NATS
     * 6. Rollback Redis on metadata update failure
     * 
     * @param roomId - Room ID
     * @param duration - Duration to add (in minutes)
     * @returns New total duration
     */
    async increaseRoomDuration(roomId: string, duration: number): Promise<number> {
        this.logger.log(`Request to increase room duration: ${roomId}, duration: ${duration}`);

        try {
            // Step 1: Get room metadata first
            const meta = await this.natsRoomService.getRoomMetadataStruct(roomId);
            if (!meta) {
                throw new Error('Invalid nil room metadata information');
            }

            // Step 2: Get current room duration info from Redis
            const info = await this.getRoomDurationInfo(roomId);

            // Get current duration from metadata as a fallback
            const metaDuration = meta.roomFeatures?.roomDuration ? parseInt(String(meta.roomFeatures.roomDuration), 10) : 0;

            // Step 3: Check if this is a breakout room
            if (meta.isBreakoutRoom) {
                // If info exists and has startedAt, the room is running
                if (info && info.startedAt > 0) {
                    if (info.duration === 0) {
                        const err = new Error("can't increase duration as breakout room has unlimited duration");
                        this.logger.warn(err.message);
                        throw err;
                    }
                    this.logger.log('Breakout room has started, will compare with parent room');

                    const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
                    const valid = info.startedAt + (info.duration * 60);
                    const timeLeft = Math.floor((valid - now) / 60);
                    const newDurationFromNow = timeLeft + duration;

                    // Compare with parent room duration
                    await this.compareDurationWithParentRoom(meta.parentRoomId, newDurationFromNow);
                } else {
                    // Room not started yet or missing from Redis
                    this.logger.log('Breakout room not started yet, comparing total duration with parent');

                    // We use metaDuration as the base since info might be missing or not yet in sync
                    const currentDuration = info ? info.duration : metaDuration;
                    await this.compareDurationWithParentRoom(meta.parentRoomId, currentDuration + duration);
                }
            }

            // Step 4: Update duration in Redis if it exists
            let newTotalDuration: number;
            if (info) {
                // Info exists in Redis, perform atomic increment
                newTotalDuration = await this.redisRoom.updateRoomDuration(roomId, 'duration', duration);
            } else {
                // Info doesn't exist in Redis (room hasn't started yet), use metadata as base
                newTotalDuration = metaDuration + duration;

                // We do NOT add it to Redis yet. If we add it with startedAt=0, 
                // the Janitor service will think it's expired and kill it.
                // It will be added to Redis with the correct startedAt when the room officially starts.
                this.logger.log(`Room not started yet, updated duration in metadata only: ${newTotalDuration} minutes`);
            }
            this.logger.log(`New total duration: ${newTotalDuration} minutes`);

            // Step 5: Update and broadcast room metadata
            // Update the roomDuration field
            if (!meta.roomFeatures) {
                meta.roomFeatures = {} as any;
            }
            meta.roomFeatures!.roomDuration = String(newTotalDuration);

            try {
                await this.natsRoomEvents.updateAndBroadcastRoomMetadata(roomId, meta);
            } catch (error) {
                // Rollback Redis change on failure
                this.logger.error(`Failed to update and broadcast room metadata, rolling back Redis change: ${error.message}`);
                // Rollback: subtract the duration we just added
                await this.redisRoom.setRoomDuration(roomId, 'duration', newTotalDuration - duration);
                throw error;
            }

            this.logger.log(`Successfully increased room duration to ${newTotalDuration} minutes`);
            return newTotalDuration;
        } catch (error) {
            this.logger.error(`Failed to increase room duration: ${error.message}`);
            throw error;
        }
    }

    /**
     * CompareDurationWithParentRoom validates breakout room duration against parent

     * 
     * Ensures breakout room duration doesn't exceed parent room's remaining time
     * 
     * @param mainRoomId - Parent room ID
     * @param duration - Proposed duration for breakout room (minutes)
     */
    async compareDurationWithParentRoom(mainRoomId: string, duration: number): Promise<void> {
        this.logger.log(`Comparing breakout room duration with parent room: ${mainRoomId}, duration: ${duration}`);

        // Get parent room duration info
        const info = await this.getRoomDurationInfo(mainRoomId);

        if (!info) {
            // No info found - parent has no duration limit
            this.logger.log('Parent room has no duration limit, comparison skipped');
            return;
        }

        if (info.duration === 0) {
            // Parent room has unlimited duration
            this.logger.log('Parent room has no duration limit, comparison skipped');
            return;
        }

        // Calculate parent room's remaining time
        const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
        const valid = info.startedAt + (info.duration * 60);
        const minutesLeft = Math.floor((valid - now) / 60);

        this.logger.log(`Parent room duration check - minutes left: ${minutesLeft}`);

        // Validate breakout room duration
        if (minutesLeft < duration) {
            const error = `Breakout room's duration (${duration}) can't be more than parent room's remaining duration (${minutesLeft})`;
            this.logger.warn(error);
            throw new Error(error);
        }

        this.logger.log('Breakout room duration validation passed');
    }
}
