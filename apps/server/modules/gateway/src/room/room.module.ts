import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RoomController } from './room.controller';
import { WebhookController } from './webhook.controller';
import { RecordingController } from './recording.controller';
import { PollsController } from './polls.controller';
import { SharedModule } from '@server/shared';

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
  ],
  controllers: [
    RoomController,
    WebhookController,
    RecordingController,
    PollsController,
  ],
})
export class RoomModule {}

