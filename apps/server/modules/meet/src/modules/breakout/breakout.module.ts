import { Module, forwardRef } from '@nestjs/common';
import { BreakoutService } from './breakout.service';
import { BreakoutNatsController } from './breakout.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsUserInfoService } from '../../interfaces/nats/nats-user-info.service';
import { NatsStreamService } from '../../interfaces/nats/nats-stream.service';
import { NatsCacheService } from '../../interfaces/nats/nats-cache.service';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { NatsModule } from '../../interfaces/nats/nats.module';
import { RoomUserService } from '../room/room-user.service';

@Module({
  imports: [
    SharedModule,
    forwardRef(() => RoomModule),
    forwardRef(() => AnalyticsModule),
    LiveKitModule,
    forwardRef(() => NatsModule),
  ],
  controllers: [BreakoutNatsController],
  providers: [BreakoutService],
  exports: [BreakoutService],
})
export class BreakoutModule { }
