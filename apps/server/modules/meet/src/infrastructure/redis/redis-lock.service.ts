/**
 * Redis Lock Service
 *
 * Provides distributed locking using Redis for room creation and other operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const REDIS_PREFIX = 'wajlc:';
const ROOM_CREATION_LOCK_KEY = `${REDIS_PREFIX}roomCreationLock-%s`;
const JANITOR_LOCK_KEY = `${REDIS_PREFIX}janitorLeaderLock`;

/**
 * Lua script for atomic check-and-delete (unlock)
 */
const UNLOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
else
    return 0
end
`;

/**
 * Lua script for atomic check-and-set TTL (renew)
 */
const RENEW_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("EXPIRE", KEYS[1], ARGV[2])
else
    return 0
end
`;

/**
 * Lock class represents a single distributed lock instance
 */
export class Lock {
    constructor(
        private readonly redis: Redis,
        private readonly key: string,
        private readonly value: string,
        private readonly ttl: number, // in seconds
    ) { }

    /**
     * TryLock attempts to acquire the lock
     */
    async tryLock(): Promise<boolean> {
        try {
            const result = await this.redis.set(this.key, this.value, 'EX', this.ttl, 'NX');
            return result === 'OK';
        } catch (error) {
            throw new Error(`Redis SetNX error for key ${this.key}: ${error instanceof Error ? error.message : error}`);
        }
    }

    /**
     * Unlock releases the lock
     */
    async unlock(): Promise<void> {
        try {
            await this.redis.eval(UNLOCK_SCRIPT, 1, this.key, this.value);
        } catch (error) {
            if (error && typeof error === 'object' && 'message' in error && error.message !== 'NOSCRIPT') {
                throw new Error(`Redis Eval error for unlock script on key ${this.key}: ${error instanceof Error ? error.message : error}`);
            }
        }
    }

    /**
     * Refresh extends the TTL of the lock
     */
    async refresh(): Promise<void> {
        try {
            const renewed = await this.redis.eval(RENEW_SCRIPT, 1, this.key, this.value, this.ttl);
            if (renewed === 0) {
                throw new Error('Lock expired or was taken by another process');
            }
        } catch (error) {
            if (error && typeof error === 'object' && 'message' in error && error.message !== 'NOSCRIPT') {
                throw new Error(`Redis Eval error for renew script on key ${this.key}: ${error instanceof Error ? error.message : error}`);
            }
            throw error;
        }
    }
}

/**
 * RedisLockService provides distributed locking functionality
 */
@Injectable()
export class RedisLockService {
    private readonly logger = new Logger(RedisLockService.name);
    private redis: Redis;

    constructor(private readonly configService: ConfigService) {
        // Initialize Redis client
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

        this.redis = new Redis(redisUrl);

        this.redis.on('error', (error) => {
            this.logger.error(`Redis connection error: ${error.message}`);
        });

        this.redis.on('connect', () => {
            this.logger.log('Redis connected successfully');
        });
    }

    /**
     * NewLock creates a new Lock instance
     */
    newLock(key: string, ttlSeconds: number): Lock {
        const value = uuidv4();
        return new Lock(this.redis, key, value, ttlSeconds);
    }

    /**
     * LockRoomCreation attempts to acquire a distributed lock for room creation
     *
     * Returns: { acquired: boolean, lockValue: string }
     */
    async lockRoomCreation(roomId: string, ttlSeconds: number = 10): Promise<{ acquired: boolean; lockValue: string }> {
        const key = ROOM_CREATION_LOCK_KEY.replace('%s', roomId);
        const value = uuidv4();

        try {
            // SetNX: SET if Not eXists
            const result = await this.redis.set(key, value, 'EX', ttlSeconds, 'NX');
            const acquired = result === 'OK';

            if (!acquired) {
                return { acquired: false, lockValue: '' };
            }

            return { acquired: true, lockValue: value };
        } catch (error) {
            throw new Error(`Redis SetNX error for key ${key}: ${error instanceof Error ? error.message : error}`);
        }
    }

    /**
     * UnlockRoomCreation safely releases a lock using the lockValue
     */
    async unlockRoomCreation(roomId: string, lockValue: string): Promise<void> {
        const key = ROOM_CREATION_LOCK_KEY.replace('%s', roomId);

        if (!lockValue) {
            // Lock was never acquired, nothing to unlock
            return;
        }

        try {
            const deleted = await this.redis.eval(
                UNLOCK_SCRIPT,
                1,
                key,
                lockValue,
            ) as number;

            if (deleted === 0) {
                throw new Error(
                    `Could not release lock on key ${key} roomId: ${roomId} (it may have expired or been taken by another process)`,
                );
            }
        } catch (error) {
            // Ignore if key doesn't exist (already expired/released)
            if (error && typeof error === 'object' && 'message' in error && !error.message.includes('NOSCRIPT')) {
                throw new Error(`Redis Eval error for unlock script on key ${key} (roomId: ${roomId}): ${error instanceof Error ? error.message : error}`);
            }
        }
    }

    /**
     * IsRoomCreationLock checks if the room creation lock exists
     */
    async isRoomCreationLock(roomId: string): Promise<boolean> {
        const key = ROOM_CREATION_LOCK_KEY.replace('%s', roomId);

        try {
            const exists = await this.redis.exists(key);
            return exists === 1;
        } catch (error) {
            throw new Error(`Redis Exists error for key ${key}: ${error instanceof Error ? error.message : error}`);
        }
    }

    /**
     * AcquireJanitorLeaderLock attempts to acquire janitor leader election lock
     */
    async acquireJanitorLeaderLock(ttlSeconds: number = 30): Promise<{ acquired: boolean; lockValue: string }> {
        const value = uuidv4();

        try {
            const result = await this.redis.set(JANITOR_LOCK_KEY, value, 'EX', ttlSeconds, 'NX');
            const acquired = result === 'OK';

            if (!acquired) {
                return { acquired: false, lockValue: '' };
            }

            return { acquired: true, lockValue: value };
        } catch (error) {
            throw new Error(`Redis SetNX error for key ${JANITOR_LOCK_KEY}: ${error instanceof Error ? error.message : error}`);
        }
    }

    /**
     * ReleaseJanitorLeadershipLock safely releases janitor leadership lock
     */
    async releaseJanitorLeadershipLock(lockValue: string): Promise<void> {
        if (!lockValue) {
            return;
        }

        try {
            await this.redis.eval(UNLOCK_SCRIPT, 1, JANITOR_LOCK_KEY, lockValue);
        } catch (error) {
            this.logger.error(`Failed to unlock janitor leadership with lockValue ${lockValue}: ${error instanceof Error ? error.message : error}`);
        }
    }

    /**
     * RenewJanitorLeadershipLock extends the TTL of the janitor leadership lock
     */
    async renewJanitorLeadershipLock(lockValue: string, ttlSeconds: number): Promise<boolean> {
        if (ttlSeconds < 1) {
            throw new Error('TTL must be at least 1 second');
        }

        try {
            const renewed = await this.redis.eval(
                RENEW_SCRIPT,
                1,
                JANITOR_LOCK_KEY,
                lockValue,
                ttlSeconds,
            ) as number;

            return renewed === 1;
        } catch (error) {
            // Key doesn't exist, couldn't renew
            if (error && typeof error === 'object' && 'message' in error && !error.message.includes('NOSCRIPT')) {
                throw new Error(`Redis Eval error for renew script on key ${JANITOR_LOCK_KEY}: ${error instanceof Error ? error.message : error}`);
            }
            return false;
        }
    }

    /**
     * Cleanup Redis connection
     */
    async onModuleDestroy() {
        await this.redis.quit();
    }
}
