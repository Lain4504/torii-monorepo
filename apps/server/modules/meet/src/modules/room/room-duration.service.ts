/**
 * Room Duration Service
 *
 * Handles room duration management and tracking
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
        private readonly configService: ConfigService,
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
    async addRoomWithDurationInfo(roomId: string, info: RoomDurationInfo): Promise<void> {
        this.logger.log(`Adding room with duration info: ${roomId}`);

        // Use Redis service to store duration info
        await this.redisRoom.addRoomWithDurationInfo(roomId, info);

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
            // Step 1: Get current room duration info
            const info = await this.getRoomDurationInfo(roomId);
            if (!info) {
                throw new Error('Room duration info not found');
            }

            // Step 2: Get room metadata
            const meta = await this.natsRoomService.getRoomMetadataStruct(roomId);
            if (!meta) {
                throw new Error('Invalid nil room metadata information');
            }

            // Step 3: Check if this is a breakout room
            if (meta.isBreakoutRoom && info) {
                if (info.startedAt === 0) {
                    throw new Error("can't increase duration as breakout room is not running");
                }
                if (info.duration === 0) {
                    throw new Error("can't increase duration as breakout room has unlimited duration");
                } else {
                    this.logger.log('Breakout room has duration, will compare with parent room');

                    // Calculate time left for breakout room
                    const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
                    const valid = info.startedAt + (info.duration * 60);
                    const timeLeft = Math.floor((valid - now) / 60);
                    const newDuration = timeLeft + duration;

                    // Compare with parent room duration
                    await this.compareDurationWithParentRoom(meta.parentRoomId, newDuration);
                }
            }

            // Step 4: Update duration in Redis
            const newTotalDuration = await this.redisRoom.updateRoomDuration(roomId, 'duration', duration);
            this.logger.log(`Updated room duration in Redis: ${newTotalDuration}`);

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
