import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { RedisPollService } from '../redis/redis-poll.service';
import { NatsService } from '../nats/nats.service';
import { NatsCacheService } from '../nats/nats-cache.service';
import { NatsRoomService } from '../nats/nats-room.service';
import { NatsRoomEventsService } from '../nats/nats-room-events.service';
import { NatsSystemEventsService } from '../nats/nats-system-events.service';
// TODO: Import AnalyticsModule later
// import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
    imports: [ConfigModule],
    controllers: [PollsController],
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
