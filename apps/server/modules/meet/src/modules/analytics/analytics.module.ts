import { Module, forwardRef } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SharedModule } from '@server/shared';
import { RedisAnalyticsService } from '@server/meet/infrastructure/redis/redis-analytics.service';
import { RedisLockService } from '@server/meet/infrastructure/redis/redis-lock.service';
import { ArtifactsModule } from '@server/meet/modules/artifacts/artifacts.module';
import { NatsService } from '@server/meet/interfaces/nats/nats.service';
import { NatsRoomService } from '@server/meet/interfaces/nats/nats-room.service';
import { NatsCacheService } from '@server/meet/interfaces/nats/nats-cache.service';
import { NatsStreamService } from '@server/meet/interfaces/nats/nats-stream.service';
import { NatsUserService } from '@server/meet/interfaces/nats/nats-user.service';
import { NatsUserInfoService } from '@server/meet/interfaces/nats/nats-user-info.service';
import { NatsModule } from '@server/meet/interfaces/nats/nats.module';
import { LiveKitModule } from '@server/meet/infrastructure/livekit/livekit.module';
import { WajlcAuthModule } from '@server/meet/modules/auth/wajlc-auth.module';
import { WebhookModule } from '@server/meet/infrastructure/webhook/webhook.module';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => ArtifactsModule),
        forwardRef(() => NatsModule),
        forwardRef(() => WebhookModule),
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
