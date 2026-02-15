import { Module, forwardRef } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SharedModule } from '@server/shared';
import { RedisAnalyticsService } from '../../infrastructure/redis/redis-analytics.service';
import { RedisLockService } from '../../infrastructure/redis/redis-lock.service';
import { ArtifactsModule } from '../artifacts/artifacts.module';

import { NatsModule } from '../../interfaces/nats/nats.module';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { WajlcAuthModule } from '../auth/wajlc-auth.module';
import { WebhookModule } from '../../infrastructure/webhook/webhook.module';

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
