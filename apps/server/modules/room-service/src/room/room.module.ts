import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';

// Controllers
import { RoomController } from './room.controller';
// Services
import { RoomCreateService } from './room-create.service';

// NATS Services
import { NatsService } from '../nats/nats.service';
import { NatsCacheService } from '../nats/nats-cache.service';
import { NatsRoomService } from '../nats/nats-room.service';
import { NatsStreamService } from '../nats/nats-stream.service';
import { NatsUserService } from '../nats/nats-user.service';
import { NatsUserInfoService } from '../nats/nats-user-info.service';

// Redis Services
import { RedisLockService } from '../redis/redis-lock.service';

// Other services
import { WebhookService } from '../webhook/webhook.service';
import { WebhookNotifierService } from '../webhook/webhook-notifier.service';
import { LiveKitService } from '../livekit/livekit.service';
import { RoomInfoService } from './room-info.service';

@Module({
  imports: [SharedModule],
  controllers: [
    RoomController,
  ],
  providers: [
    // Room services
    RoomCreateService,
    RoomInfoService,
    WebhookService,

    // NATS services
    NatsService,
    NatsCacheService,
    NatsRoomService,
    NatsStreamService,
    NatsUserService,
    NatsUserInfoService,

    // Redis services
    RedisLockService,

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

