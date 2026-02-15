import { Module, forwardRef } from '@nestjs/common';
import { BreakoutService } from './breakout.service';
import { BreakoutNatsController } from './breakout.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '@server/meet/modules/room/room.module';
import { AnalyticsModule } from '@server/meet/modules/analytics/analytics.module';
import { NatsService } from '@server/meet/interfaces/nats/nats.service';
import { NatsRoomService } from '@server/meet/interfaces/nats/nats-room.service';
import { NatsSystemEventsService } from '@server/meet/interfaces/nats/nats-system-events.service';
import { NatsUserService } from '@server/meet/interfaces/nats/nats-user.service';
import { NatsUserInfoService } from '@server/meet/interfaces/nats/nats-user-info.service';
import { NatsStreamService } from '@server/meet/interfaces/nats/nats-stream.service';
import { NatsCacheService } from '@server/meet/interfaces/nats/nats-cache.service';
import { LiveKitModule } from '@server/meet/infrastructure/livekit/livekit.module';
import { NatsModule } from '@server/meet/interfaces/nats/nats.module';
import { RoomUserService } from '@server/meet/modules/room/room-user.service';

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
