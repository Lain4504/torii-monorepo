import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { SharedModule } from '@server/shared';
import { RedisPollService } from '../../infrastructure/redis/redis-poll.service';
import { RedisLockService } from '../../infrastructure/redis/redis-lock.service';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { NatsCacheService } from '../../interfaces/nats/nats-cache.service';
import { NatsStreamService } from '../../interfaces/nats/nats-stream.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsUserInfoService } from '../../interfaces/nats/nats-user-info.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';
import { WajlcAuthService } from '../auth/wajlc-auth.service';

@Module({
    imports: [SharedModule, AnalyticsModule],
    providers: [
        PollsService,
        RedisPollService,
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
        NatsRoomEventsService,
    ],
    exports: [PollsService],
})
export class PollsModule { }
