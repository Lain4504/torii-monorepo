import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';

// Controllers
import { RoomController } from './room.controller';
import { UserController } from './user.controller';
import { WebhookController } from '../webhook/webhook.controller';
// Services
import { RoomCreateService } from './room-create.service';
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

// Redis Services
import { RedisLockService } from '../redis/redis-lock.service';
import { RedisRoomService } from '../redis/redis-room.service';

// Other services
import { WebhookService } from '../webhook/webhook.service';
import { WebhookNotifierService } from '../webhook/webhook-notifier.service';
import { LiveKitService } from '../livekit/livekit.service';
import { RoomInfoService } from './room-info.service';

// Auth services
import { PlugNmeetAuthService } from '../auth/plugnmeet-auth.service';

@Module({
  imports: [SharedModule],
  controllers: [
    RoomController,
    UserController,
    WebhookController,
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
    PlugNmeetAuthService,

    // NATS services
    NatsService,
    NatsCacheService,
    NatsRoomService,
    NatsRoomEventsService,
    NatsSystemEventsService,
    NatsStreamService,
    NatsUserService,
    NatsUserInfoService,

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

