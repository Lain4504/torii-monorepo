import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RoomController } from './room.controller';
import { WebhookController } from './webhook.controller';
import { RecordingController } from './recording.controller';
import { PollsController } from './polls.controller';
import { SharedModule } from '@server/shared';

import { BreakoutRoomController } from './breakout-room.controller';
import { RecorderController } from './recorder.controller';
import { WaitingRoomController } from './waiting-room.controller';
import { IngressController } from './ingress.controller';
import { UserTrackingModule } from '../user-tracking.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ROOM_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      },
    ]),
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

