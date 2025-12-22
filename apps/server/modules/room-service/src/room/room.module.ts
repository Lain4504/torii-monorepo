import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';

// Controllers
import { RoomController } from './room.controller';
import { PollController } from './poll.controller';
import { BreakoutRoomController } from './breakout-room.controller';
import { WaitingRoomController } from './waiting-room.controller';
import { UserController } from './user.controller';
import { FileController } from './file.controller';
import { ExternalMediaController } from './external-media.controller';

// Services
import { RoomService } from './room.service';
import { RoomCreateService } from './room-create.service';
import { PollService } from './poll.service';
import { BreakoutRoomService } from './breakout-room.service';
import { WaitingRoomService } from './waiting-room.service';
import { UserService } from './user.service';
import { FileService } from './file.service';
import { ExternalMediaService } from './external-media.service';

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
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsController } from '../analytics/analytics.controller';
import { WebhookService } from '../webhook/webhook.service';
import { WebhookNotifierService } from '../webhook/webhook-notifier.service';
import { LiveKitService } from '../livekit/livekit.service';
import { RoomInfoService } from './room-info.service';

@Module({
  imports: [SharedModule],
  controllers: [
    RoomController,
    PollController,
    BreakoutRoomController,
    WaitingRoomController,
    UserController,
    FileController,
    ExternalMediaController,
    AnalyticsController,
  ],
  providers: [
    // Room services
    RoomService,
    RoomCreateService,
    RoomInfoService,
    PollService,
    BreakoutRoomService,
    WaitingRoomService,
    UserService,
    FileService,
    ExternalMediaService,
    AnalyticsService,
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
    RoomService,
    RoomInfoService,
    PollService,
    BreakoutRoomService,
    WaitingRoomService,
    UserService,
    FileService,
    ExternalMediaService,
    AnalyticsService,
    LiveKitService,
  ],
})
export class RoomModule { }

