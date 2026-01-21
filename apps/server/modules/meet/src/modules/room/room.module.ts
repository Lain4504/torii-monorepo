import { Module, forwardRef } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FileModule } from '../file/file.module';
import { WebhookModule } from '../../infrastructure/webhook/webhook.module';
import { ArtifactsModule } from '../artifacts/artifacts.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PollsModule } from '../polls/polls.module';
import { EtherpadModule } from '../etherpad/etherpad.module';
import { BreakoutModule } from '../breakout/breakout.module';

// Controllers

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
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';

// Auth services
import { WajlcAuthService } from '../auth/wajlc-auth.service';

@Module({
  imports: [SharedModule, FileModule, forwardRef(() => WebhookModule), ArtifactsModule, AnalyticsModule, PollsModule, forwardRef(() => EtherpadModule), forwardRef(() => BreakoutModule)],
  controllers: [
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
  ],
  exports: [
    RoomInfoService,
    RoomCreateService,
    RoomEndService,
    RoomModifyService,
    RoomUserService,
    RoomDurationService,
    WaitingRoomService,
    LiveKitService,
    NatsService,
    NatsRoomService,
    NatsUserService,
    NatsSystemEventsService,
    NatsUserInfoService,
    NatsCacheService,
    NatsStreamService,
  ],
})
export class RoomModule { }

