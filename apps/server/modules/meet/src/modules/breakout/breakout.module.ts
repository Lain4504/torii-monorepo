import { Module, forwardRef } from '@nestjs/common';
import { BreakoutService } from './breakout.service';
import { BreakoutNatsController } from './breakout.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { NatsModule } from '../../interfaces/nats/nats.module';

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
