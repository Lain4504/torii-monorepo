import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';

// Controllers

import { WebhookController } from '../../infrastructure/webhook/webhook.controller';

// NOTE: NatsAuthCalloutController removed - auth callout is now handled
// directly in NatsController via raw NATS subscription to bypass JSON parsing

// Services
import { RoomCreateService } from './room-create.service';
import { RoomInfoService } from './room-info.service';
import { RoomModifyService } from './room-modify.service';
import { RoomEndService } from './room-end.service';
import { RoomDurationService } from './room-duration.service';
import { RoomUserService } from './room-user.service';
import { WaitingRoomService } from '../waiting-room/waiting-room.service';

// NATS Services
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsCacheService } from '../../interfaces/nats/nats-cache.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { NatsStreamService } from '../../interfaces/nats/nats-stream.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsUserInfoService } from '../../interfaces/nats/nats-user-info.service';
import { NatsAuthCalloutService } from '../../interfaces/nats/nats-auth-callout.service';
import { NatsConsumerService } from '../../interfaces/nats/nats-consumer.service';
import { NatsController } from '../../interfaces/nats/nats.controller';

// Redis Services
import { RedisLockService } from '../../infrastructure/redis/redis-lock.service';
import { RedisRoomService } from '../../infrastructure/redis/redis-room.service';

// Other services
import { WebhookService } from '../../infrastructure/webhook/webhook.service';
import { WebhookNotifierService } from '../../infrastructure/webhook/webhook-notifier.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';

// Polls services
import { PollsService } from '../polls/polls.service';
import { RedisPollService } from '../../infrastructure/redis/redis-poll.service';
// TODO: Import AnalyticsService later
// import { AnalyticsService } from '../analytics/analytics.service';

// Auth services
import { WajlcAuthService } from '../auth/wajlc-auth.service';

@Module({
  imports: [SharedModule],
  controllers: [
    WebhookController,
    // NatsAuthCalloutController removed - handled in NatsController now
  ],
  providers: [
    // Room services
    RoomCreateService,
    RoomInfoService,
    RoomModifyService,
    RoomEndService,
    RoomDurationService,
    RoomUserService,
    WebhookService,
    WaitingRoomService,

    // Auth services
    WajlcAuthService,

    // NATS services
    NatsService,
    NatsCacheService,
    NatsRoomService,
    NatsRoomEventsService,
    NatsSystemEventsService,
    NatsStreamService,
    NatsUserService,
    NatsUserInfoService,
    NatsAuthCalloutService,
    NatsConsumerService,
    NatsController,

    // Redis services
    RedisLockService,
    RedisRoomService,

    // LiveKit services
    LiveKitService,

    // Webhook services
    WebhookNotifierService,

    // Polls services
    PollsService,
    RedisPollService,
    // TODO: Add AnalyticsService later
  ],
  exports: [
    RoomInfoService,
    RoomCreateService,
    RoomEndService,
    RoomModifyService,
    RoomUserService,
    RoomDurationService,
    PollsService, // Export PollsService so it can be used in MeetModule
    WebhookService, // Export WebhookService
    WaitingRoomService, // Export WaitingRoomService
    LiveKitService,
  ],
})
export class RoomModule { }

