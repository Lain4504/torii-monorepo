/**
 * Redis Room Service
 * Equivalent to Go: plugNmeet-server/pkg/services/redis/room.go
 * 
 * Handles temporary room data caching in Redis
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { NatsKvRoomInfo } from '@workspace/protocol';

const REDIS_PREFIX = 'pnm:';
const TEMPORARY_ROOM_DATA_KEY = `${REDIS_PREFIX}temporaryRoomData:%s`;

/**
 * RedisRoomService handles room-related Redis operations
 * Equivalent to Go: RedisService methods in room.go
 */
@Injectable()
export class RedisRoomService {
    private readonly logger = new Logger(RedisRoomService.name);
    private redis: Redis;

    constructor(private readonly configService: ConfigService) {
        let redisUrl = this.configService.get<string>('REDIS_URL');

        if (!redisUrl) {
            const host = this.configService.get<string>('REDIS_HOST', 'localhost');
            const port = this.configService.get<string>('REDIS_PORT', '6379');
            const password = this.configService.get<string>('REDIS_PASSWORD');

            if (password) {
                redisUrl = `redis://:${password}@${host}:${port}`;
            } else {
                redisUrl = `redis://${host}:${port}`;
            }
        }

        if (!redisUrl) {
            throw new Error('REDIS_URL or REDIS_HOST/PORT is not configured');
        }
        this.redis = new Redis(redisUrl);
    }

    /**
     * HoldTemporaryRoomData stores room data temporarily for 1 minute
     * Equivalent to Go: s.HoldTemporaryRoomData (room.go:17-33)
     * 
     * This serves as a fallback in case the 'room_finished' webhook from LiveKit is delayed.
     * 
     * @param info - NatsKvRoomInfo to cache
     */
    async holdTemporaryRoomData(info: NatsKvRoomInfo): Promise<void> {
        this.logger.log(`Holding temporary room data: ${info.roomId}, sid: ${info.roomSid}`);

        try {
            // Marshal to JSON
            const jsonData = JSON.stringify(info);

            // Create Redis key
            const key = TEMPORARY_ROOM_DATA_KEY.replace('%s', info.roomId);

            // Store with 1 minute TTL using SETNX (set if not exists)
            // Equivalent to Go: s.rc.SetNX(s.ctx, key, marshal, time.Minute*1)
            const result = await this.redis.set(
                key,
                jsonData,
                'EX', 60,  // 60 seconds = 1 minute
                'NX',      // Only set if key doesn't exist
            );

            if (!result) {
                this.logger.debug(`Temporary room data already exists for: ${info.roomId}`);
            } else {
                this.logger.debug(`Temporary room data stored for: ${info.roomId}`);
            }
        } catch (error) {
            this.logger.error(`SetNX failed for room ${info.roomId}: ${error.message}`);
        }
    }

    /**
     * GetTemporaryRoomData retrieves cached room data
     * Equivalent to Go: s.GetTemporaryRoomData (room.go:35-63)
     * 
     * Returns room info with status set to 'ended' to prevent loops.
     * 
     * @param roomId - Room ID to retrieve
     * @returns NatsKvRoomInfo or null if not found
     */
    async getTemporaryRoomData(roomId: string): Promise<NatsKvRoomInfo | null> {
        this.logger.log(`Getting temporary room data: ${roomId}`);

        try {
            // Create Redis key
            const key = TEMPORARY_ROOM_DATA_KEY.replace('%s', roomId);

            // Get value from Redis
            const val = await this.redis.get(key);

            if (!val || val === '') {
                this.logger.debug(`No temporary room data found for: ${roomId}`);
                return null;
            }

            // Parse JSON
            const info = JSON.parse(val) as NatsKvRoomInfo;

            // Set status to 'ended' to prevent looping
            // Equivalent to Go: info.Status = natsservice.RoomStatusEnded
            info.status = 'ended';

            this.logger.debug(`Temporary room data retrieved for: ${roomId}`);
            return info;
        } catch (error) {
            // It's normal for the key not to be found
            // We only log actual Redis communication errors
            if (error.message !== 'Key not found') {
                this.logger.error(`Get failed for room ${roomId}: ${error.message}`);
            }
            return null;
        }
    }

    // ============================================================================
    // Room Duration Methods (from room_duration.go)
    // ============================================================================

    /**
     * AddRoomWithDurationInfo adds room with duration info to Redis
     * Equivalent to Go: s.AddRoomWithDurationInfo (room_duration.go:15-26)
     * 
     * @param roomId - Room ID
     * @param info - RoomDurationInfo with duration and startedAt
     */
    async addRoomWithDurationInfo(roomId: string, info: { duration: number; startedAt: number }): Promise<void> {
        const key = `${REDIS_PREFIX}roomWithDurationInfo:${roomId}`;

        try {
            // Pipeline: HSET + EXPIRE
            // Equivalent to Go: pipe.HSet(s.ctx, key, vals) + pipe.Expire(s.ctx, key, time.Hour*24)
            const pipeline = this.redis.pipeline();
            pipeline.hset(key, 'duration', info.duration, 'startedAt', info.startedAt);
            pipeline.expire(key, 60 * 60 * 24); // 24 hours
            await pipeline.exec();

            this.logger.debug(`Added room with duration info: ${roomId}`);
        } catch (error) {
            this.logger.error(`Failed to add room duration info: ${error.message}`);
            throw error;
        }
    }

    /**
     * SetRoomDuration sets a specific duration field
     * Equivalent to Go: s.SetRoomDuration (room_duration.go:28-39)
     * 
     * @param roomId - Room ID
     * @param durationField - Field name (e.g., "duration")
     * @param value - Duration value
     */
    async setRoomDuration(roomId: string, durationField: string, value: number): Promise<void> {
        const key = `${REDIS_PREFIX}roomWithDurationInfo:${roomId}`;

        try {
            // Pipeline: HSET + EXPIRE
            const pipeline = this.redis.pipeline();
            pipeline.hset(key, durationField, value);
            pipeline.expire(key, 60 * 60 * 24); // 24 hours
            await pipeline.exec();

            this.logger.debug(`Set room duration field ${durationField}: ${roomId}`);
        } catch (error) {
            this.logger.error(`Failed to set room duration: ${error.message}`);
            throw error;
        }
    }

    /**
     * UpdateRoomDuration increments the duration field
     * Equivalent to Go: s.UpdateRoomDuration (room_duration.go:41-43)
     * 
     * @param roomId - Room ID
     * @param durationField - Field name (e.g., "duration")
     * @param amount - Amount to increment
     * @returns New value after increment
     */
    async updateRoomDuration(roomId: string, durationField: string, amount: number): Promise<number> {
        const key = `${REDIS_PREFIX}roomWithDurationInfo:${roomId}`;

        try {
            // HINCRBY: Increment hash field by amount
            // Equivalent to Go: s.rc.HIncrBy(s.ctx, key, durationField, int64(duration))
            const result = await this.redis.hincrby(key, durationField, amount);

            this.logger.debug(`Updated room duration: ${roomId}, new value: ${result}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to update room duration: ${error.message}`);
            throw error;
        }
    }

    /**
     * GetRoomWithDurationInfo retrieves room duration info
     * Equivalent to Go: s.GetRoomWithDurationInfo (room_duration.go:45-54)
     * 
     * @param roomId - Room ID
     * @returns RoomDurationInfo or null if not found
     */
    async getRoomWithDurationInfo(roomId: string): Promise<{ duration: number; startedAt: number } | null> {
        const key = `${REDIS_PREFIX}roomWithDurationInfo:${roomId}`;

        try {
            // HGETALL: Get all hash fields
            const result = await this.redis.hgetall(key);

            if (!result || Object.keys(result).length === 0) {
                return null;
            }

            // Convert string values to numbers
            return {
                duration: parseInt(result.duration || '0', 10),
                startedAt: parseInt(result.startedAt || '0', 10),
            };
        } catch (error) {
            this.logger.error(`Failed to get room duration info: ${error.message}`);
            return null;
        }
    }

    /**
     * DeleteRoomWithDuration removes room duration info
     * Equivalent to Go: s.DeleteRoomWithDuration (room_duration.go:71-77)
     * 
     * @param roomId - Room ID
     */
    async deleteRoomWithDuration(roomId: string): Promise<void> {
        const key = `${REDIS_PREFIX}roomWithDurationInfo:${roomId}`;

        try {
            // DEL: Delete key
            await this.redis.del(key);
            this.logger.debug(`Deleted room duration info: ${roomId}`);
        } catch (error) {
            this.logger.error(`Failed to delete room duration: ${error.message}`);
            throw error;
        }
    }

    /**
     * Close Redis connection
     */
    async onModuleDestroy() {
        await this.redis.quit();
    }
}
