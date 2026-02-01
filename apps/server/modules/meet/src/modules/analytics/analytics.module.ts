import { Module, forwardRef } from '@nestjs/common';
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
import { NatsModule } from '../../interfaces/nats/nats.module';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { WajlcAuthModule } from '../auth/wajlc-auth.module';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => ArtifactsModule),
        forwardRef(() => NatsModule),
        LiveKitModule,
        WajlcAuthModule,
    ],
    providers: [
        AnalyticsService,
        RedisAnalyticsService,
        RedisLockService,
    ],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
