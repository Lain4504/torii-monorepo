/**
 * Redis Insights Service
 *
 * Handles Redis operations for AI Insights (Transcription, Translation, AI Chat)
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const REDIS_PREFIX = 'wajlc:';
const TRANSCRIPTION_SESSIONS_KEY = `${REDIS_PREFIX}insights:transcription_sessions:%s`;
const TRANSCRIPTION_USAGE_KEY = `${REDIS_PREFIX}insights:transcription_usage:%s`;
const CHAT_TRANSLATION_USAGE_KEY = `${REDIS_PREFIX}insights:chat_translation_usage:%s`;
const AI_TEXT_CHAT_USAGE_KEY = `${REDIS_PREFIX}insights:ai_text_chat_usage:%s`;
const TTS_SERVICE_USAGE_KEY = `${REDIS_PREFIX}insights:ttsService:%s:usage`;
const TOTAL_USAGE_FIELD = 'total_usage';

@Injectable()
export class RedisInsightsService {
    private readonly logger = new Logger(RedisInsightsService.name);
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

    /**
     * HandleTranscriptionUsage manages transcription session lifecycle and usage
     */
    async handleTranscriptionUsage(roomId: string, userId: string, isStarted: boolean): Promise<number> {
        const sessionsKey = TRANSCRIPTION_SESSIONS_KEY.replace('%s', roomId);
        const usageKey = TRANSCRIPTION_USAGE_KEY.replace('%s', roomId);

        if (isStarted) {
            const pipeline = this.redis.pipeline();
            pipeline.hset(sessionsKey, userId, Math.floor(Date.now() / 1000));
            pipeline.expire(sessionsKey, 24 * 60 * 60);
            await pipeline.exec();
            return 0;
        }

        const startTimeStr = await this.redis.hget(sessionsKey, userId);
        if (!startTimeStr) return 0;

        await this.redis.hdel(sessionsKey, userId);

        const startTime = parseInt(startTimeStr, 10);
        const duration = Math.floor(Date.now() / 1000) - startTime;
        const finalDuration = duration < 0 ? 0 : duration;

        const pipeline = this.redis.pipeline();
        pipeline.hincrby(usageKey, userId, finalDuration);
        pipeline.hincrby(usageKey, TOTAL_USAGE_FIELD, finalDuration);
        pipeline.expire(usageKey, 24 * 60 * 60);
        await pipeline.exec();

        return finalDuration;
    }

    async getTranscriptionRoomUsage(roomId: string, cleanup = false): Promise<Record<string, number>> {
        const key = TRANSCRIPTION_USAGE_KEY.replace('%s', roomId);
        const rawMap = await this.redis.hgetall(key);

        if (cleanup) {
            await this.redis.del(key);
        }

        const usageMap: Record<string, number> = {};
        for (const [k, v] of Object.entries(rawMap)) {
            usageMap[k] = parseInt(v, 10) || 0;
        }
        return usageMap;
    }

    /**
     * IncrementChatTranslationUsage records text translation usage
     */
    async incrementChatTranslationUsage(roomId: string, userId: string, characters: number): Promise<number> {
        const key = CHAT_TRANSLATION_USAGE_KEY.replace('%s', roomId);
        const pipeline = this.redis.pipeline();
        pipeline.hincrby(key, userId, characters);
        pipeline.hincrby(key, TOTAL_USAGE_FIELD, characters);
        pipeline.expire(key, 24 * 60 * 60);
        const results = await pipeline.exec();
        return (results?.[0]?.[1] as number) || 0;
    }

    async getChatTranslationRoomUsage(roomId: string, cleanup = false): Promise<Record<string, number>> {
        const key = CHAT_TRANSLATION_USAGE_KEY.replace('%s', roomId);
        const rawMap = await this.redis.hgetall(key);
        if (cleanup) await this.redis.del(key);
        const usageMap: Record<string, number> = {};
        for (const [k, v] of Object.entries(rawMap)) {
            usageMap[k] = parseInt(v, 10) || 0;
        }
        return usageMap;
    }

    /**
     * IncrementAITextChatUsage records AI chat token usage
     */
    async incrementAITextChatUsage(roomId: string, userId: string, tokens: number): Promise<number> {
        const key = AI_TEXT_CHAT_USAGE_KEY.replace('%s', roomId);
        const pipeline = this.redis.pipeline();
        pipeline.hincrby(key, userId, tokens);
        pipeline.hincrby(key, TOTAL_USAGE_FIELD, tokens);
        pipeline.expire(key, 24 * 60 * 60);
        const results = await pipeline.exec();
        return (results?.[0]?.[1] as number) || 0;
    }

    async getAITextChatRoomUsage(roomId: string, cleanup = false): Promise<Record<string, number>> {
        const key = AI_TEXT_CHAT_USAGE_KEY.replace('%s', roomId);
        const rawMap = await this.redis.hgetall(key);
        if (cleanup) await this.redis.del(key);
        const usageMap: Record<string, number> = {};
        for (const [k, v] of Object.entries(rawMap)) {
            usageMap[k] = parseInt(v, 10) || 0;
        }
        return usageMap;
    }

    async updateTTSServiceUsage(roomId: string, userId: string, language: string, incBy: number): Promise<void> {
        const key = TTS_SERVICE_USAGE_KEY.replace('%s', roomId);
        const pipeline = this.redis.pipeline();
        pipeline.hincrby(key, userId, incBy);
        pipeline.hincrby(key, language, incBy);
        pipeline.hincrby(key, TOTAL_USAGE_FIELD, incBy);
        pipeline.expire(key, 24 * 60 * 60);
        await pipeline.exec();
    }

    async getTTSServiceRoomUsage(roomId: string, cleanup = false): Promise<Record<string, number>> {
        const key = TTS_SERVICE_USAGE_KEY.replace('%s', roomId);
        const rawMap = await this.redis.hgetall(key);
        if (cleanup) await this.redis.del(key);
        const usageMap: Record<string, number> = {};
        for (const [k, v] of Object.entries(rawMap)) {
            usageMap[k] = parseInt(v, 10) || 0;
        }
        return usageMap;
    }
}
