import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PollsService } from './polls.service';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsCacheService } from '../../interfaces/nats/nats-cache.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { RedisPollService } from '../../infrastructure/redis/redis-poll.service';
// TODO: Import AnalyticsModule later
// import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
    imports: [ConfigModule],
    controllers: [],
    providers: [
        PollsService,
        RedisPollService,
        NatsService,
        NatsCacheService,
        NatsRoomService,
        NatsRoomEventsService,
        NatsSystemEventsService,
        // TODO: Add AnalyticsService later
    ],
    exports: [PollsService],
})
export class PollsModule { }
