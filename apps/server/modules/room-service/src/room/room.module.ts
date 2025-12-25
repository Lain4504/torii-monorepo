import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';

// Controllers
import { RoomController } from './room.controller';
import { UserController } from './user.controller';
import { WebhookController } from '../webhook/webhook.controller';
// NOTE: NatsAuthCalloutController removed - auth callout is now handled
// directly in NatsController via raw NATS subscription to bypass JSON parsing

// Services
import { RoomCreateService } from './room-create.service';
import { RoomInfoService } from './room-info.service';
import { RoomModifyService } from './room-modify.service';
import { RoomEndService } from './room-end.service';
import { RoomDurationService } from './room-duration.service';
import { RoomUserService } from './room-user.service';

// NATS Services
import { NatsService } from '../nats/nats.service';
import { NatsCacheService } from '../nats/nats-cache.service';
import { NatsRoomService } from '../nats/nats-room.service';
import { NatsRoomEventsService } from '../nats/nats-room-events.service';
import { NatsSystemEventsService } from '../nats/nats-system-events.service';
import { NatsStreamService } from '../nats/nats-stream.service';
import { NatsUserService } from '../nats/nats-user.service';
import { NatsUserInfoService } from '../nats/nats-user-info.service';
import { NatsAuthCalloutService } from '../nats/nats-auth-callout.service';
import { NatsConsumerService } from '../nats/nats-consumer.service';
import { NatsController } from '../nats/nats.controller';

// Redis Services
import { RedisLockService } from '../redis/redis-lock.service';
import { RedisRoomService } from '../redis/redis-room.service';

// Other services
import { WebhookService } from '../webhook/webhook.service';
import { WebhookNotifierService } from '../webhook/webhook-notifier.service';
import { LiveKitService } from '../livekit/livekit.service';

// Auth services
import { WajlcAuthService } from '../auth/wajlc-auth.service';

@Module({
  imports: [SharedModule],
  controllers: [
    RoomController,
    UserController,
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
  ],
  exports: [
    RoomInfoService,
    LiveKitService,
  ],
})
export class RoomModule { }

