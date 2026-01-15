import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './modules/room/room.module';
import { SharedModule } from '@server/shared';

// NATS Handlers (replacing HTTP controllers)
import { PollsHandler } from './interfaces/nats/polls.handler';
import { RoomHandler } from './interfaces/nats/room.handler';
import { WaitingRoomHandler } from './interfaces/nats/waiting-room.handler';
import { WebhookHandler } from './interfaces/nats/webhook.handler';
import { UserHandler } from './interfaces/nats/user.handler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../.env', // Load from monorepo root
    }),
    SharedModule,
    RoomModule,
  ],
  controllers: [
    // NATS Handlers (not HTTP controllers)
    PollsHandler,
    RoomHandler,
    WaitingRoomHandler,
    WebhookHandler,
    UserHandler,
  ],
})
export class MeetModule { }

