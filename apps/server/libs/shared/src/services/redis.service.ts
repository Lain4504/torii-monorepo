import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
        const port = this.configService.get<number>('REDIS_PORT') || 6379;
        const password = this.configService.get<string>('REDIS_PASSWORD');

        this.client = new Redis({
            host,
            port,
            password,
            lazyConnect: true,
        });

        this.client.on('error', (err) => {
            this.logger.error(`Redis connection error: ${err.message}`);
        });

        this.client.on('connect', () => {
            this.logger.log('Redis connected successfully');
        });
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }

    getClient(): Redis {
        return this.client;
    }

    async hset(key: string, field: string, value: string): Promise<number> {
        return this.client.hset(key, field, value);
    }

    async hget(key: string, field: string): Promise<string | null> {
        return this.client.hget(key, field);
    }

    async hgetall(key: string): Promise<Record<string, string>> {
        return this.client.hgetall(key);
    }

    async hdel(key: string, field: string): Promise<number> {
        return this.client.hdel(key, field);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    async expire(key: string, seconds: number): Promise<number> {
        return this.client.expire(key, seconds);
    }
}
