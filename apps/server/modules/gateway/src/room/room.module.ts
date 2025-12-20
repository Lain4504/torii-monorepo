import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { WebhookController } from './webhook.controller';
import { RecordingController } from './recording.controller';
import { PollsController } from './polls.controller';
import { NatsClientModule, SharedModule } from '@server/shared';
import { BreakoutRoomController } from './breakout-room.controller';
import { RecorderController } from './recorder.controller';
import { WaitingRoomController } from './waiting-room.controller';
import { IngressController } from './ingress.controller';
import { UserTrackingModule } from '../user-tracking.module';

@Module({
  imports: [
    NatsClientModule,
    SharedModule,
    UserTrackingModule,
  ],
  controllers: [
    RoomController,
    WebhookController,
    RecordingController,
    PollsController,
    BreakoutRoomController,
    RecorderController,
    WaitingRoomController,
    IngressController,
  ],
})
export class RoomModule { }
