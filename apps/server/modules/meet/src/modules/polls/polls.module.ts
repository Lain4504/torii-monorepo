import { Module, forwardRef } from '@nestjs/common';
import { PollsService } from './polls.service';
import { SharedModule } from '@server/shared';
import { RedisPollService } from '../../infrastructure/redis/redis-poll.service';
import { RedisLockService } from '../../infrastructure/redis/redis-lock.service';

import { AnalyticsModule } from '../analytics/analytics.module';
import { NatsModule } from '../../interfaces/nats/nats.module';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { WajlcAuthModule } from '../auth/wajlc-auth.module';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => AnalyticsModule),
        forwardRef(() => NatsModule),
        LiveKitModule,
        WajlcAuthModule,
    ],
    providers: [
        PollsService,
        RedisPollService,
        RedisLockService,
    ],
    exports: [PollsService],
})
export class PollsModule { }
