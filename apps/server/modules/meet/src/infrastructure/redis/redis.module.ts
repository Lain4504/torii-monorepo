import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisLockService } from './redis-lock.service';
import { RedisRoomService } from './redis-room.service';
import { RedisAnalyticsService } from './redis-analytics.service';
import { RedisInsightsService } from './redis-insights.service';
import { RedisPollService } from './redis-poll.service';
import { RedisSpeechToTextService } from './redis-speech-to-text.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        RedisLockService,
        RedisRoomService,
        RedisAnalyticsService,
        RedisInsightsService,
        RedisPollService,
        RedisSpeechToTextService,
    ],
    exports: [
        RedisLockService,
        RedisRoomService,
        RedisAnalyticsService,
        RedisInsightsService,
        RedisPollService,
        RedisSpeechToTextService,
    ],
})
export class RedisModule { }
