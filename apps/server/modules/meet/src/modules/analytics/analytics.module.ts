import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SharedModule } from '@server/shared';
import { RedisAnalyticsService } from '../../infrastructure/redis/redis-analytics.service';
import { RedisLockService } from '../../infrastructure/redis/redis-lock.service';
import { ArtifactsModule } from '../artifacts/artifacts.module';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsCacheService } from '../../interfaces/nats/nats-cache.service';
import { NatsStreamService } from '../../interfaces/nats/nats-stream.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsUserInfoService } from '../../interfaces/nats/nats-user-info.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';
import { WajlcAuthService } from '../auth/wajlc-auth.service';

@Module({
    imports: [
        SharedModule,
        ArtifactsModule,
    ],
    providers: [
        AnalyticsService,
        RedisAnalyticsService,
        RedisLockService,
        NatsService,
        NatsCacheService,
        NatsStreamService,
        NatsUserInfoService,
        LiveKitService,
        WajlcAuthService,
        NatsSystemEventsService,
        NatsUserService,
        NatsRoomService,
    ],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
