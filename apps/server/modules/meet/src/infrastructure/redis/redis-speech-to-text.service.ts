/**
 * Redis Speech To Text Service
 *
 * Handles Redis operations for Azure Speech Services
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SpeechServiceUserStatusTasks } from '@workspace/protocol';

const REDIS_PREFIX = 'wajlc:';
const SPEECH_SERVICE_REDIS_KEY = `${REDIS_PREFIX}speechService`;

@Injectable()
export class RedisSpeechToTextService {
    private readonly logger = new Logger(RedisSpeechToTextService.name);
    private redis: Redis;

    constructor(private readonly configService: ConfigService) {
        let redisUrl = this.configService.get<string>('REDIS_URL');
        if (!redisUrl) {
            const host = this.configService.get<string>('REDIS_HOST', 'localhost');
            const port = this.configService.get<string>('REDIS_PORT', '6379');
            const password = this.configService.get<string>('REDIS_PASSWORD');
            redisUrl = password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`;
        }
        this.redis = new Redis(redisUrl);
    }

    async getConnectionsByKeyId(keyId: string): Promise<string> {
        const key = `${SPEECH_SERVICE_REDIS_KEY}:${keyId}:connections`;
        return (await this.redis.get(key)) || '';
    }

    async updateUserStatus(keyId: string, task: SpeechServiceUserStatusTasks): Promise<void> {
        const key = `${SPEECH_SERVICE_REDIS_KEY}:${keyId}:connections`;
        if (task === SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_SESSION_STARTED) {
            await this.redis.incr(key);
        } else if (task === SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_SESSION_ENDED) {
            await this.redis.decr(key);
        }
    }

    async checkUserUsage(roomId: string, userId: string): Promise<string> {
        const key = `${SPEECH_SERVICE_REDIS_KEY}:${roomId}:usage`;
        return (await this.redis.hget(key, userId)) || '';
    }

    async usersUsage(roomId: string, userId: string, task: SpeechServiceUserStatusTasks): Promise<number> {
        const key = `${SPEECH_SERVICE_REDIS_KEY}:${roomId}:usage`;

        if (task === SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_SESSION_STARTED) {
            await this.redis.hset(key, userId, Math.floor(Date.now() / 1000));
            return 0;
        } else if (task === SpeechServiceUserStatusTasks.SPEECH_TO_TEXT_SESSION_ENDED) {
            const startTimeStr = await this.redis.hget(key, userId);
            if (!startTimeStr) return 0;

            const startTime = parseInt(startTimeStr, 10);
            const usage = Math.floor(Date.now() / 1000) - startTime;
            const finalUsage = usage < 0 ? 0 : usage;

            const pipeline = this.redis.pipeline();
            pipeline.hincrby(key, 'total_usage', finalUsage);
            pipeline.hdel(key, userId);
            await pipeline.exec();
            return finalUsage;
        }
        return 0;
    }

    async azureKeyRequestedTask(roomId: string, userId: string, task: 'check' | 'add' | 'remove'): Promise<string> {
        const key = `${SPEECH_SERVICE_REDIS_KEY}:${roomId}:${userId}:azureKeyRequested`;

        switch (task) {
            case 'check':
                const e = await this.redis.get(key);
                return e ? 'exist' : '';
            case 'add':
                await this.redis.set(key, userId, 'EX', 300); // 5 minutes
                return '';
            case 'remove':
                await this.redis.del(key);
                return '';
        }
    }

    async getHashKeys(roomId: string): Promise<string[]> {
        const key = `${SPEECH_SERVICE_REDIS_KEY}:${roomId}:usage`;
        return await this.redis.hkeys(key);
    }

    async getTotalUsageByRoomId(roomId: string): Promise<string> {
        const key = `${SPEECH_SERVICE_REDIS_KEY}:${roomId}:usage`;
        return (await this.redis.hget(key, 'total_usage')) || '0';
    }

    async deleteRoom(roomId: string): Promise<void> {
        const key = `${SPEECH_SERVICE_REDIS_KEY}:${roomId}:usage`;
        await this.redis.del(key);
    }
}
