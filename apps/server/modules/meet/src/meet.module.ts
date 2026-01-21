import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './modules/room/room.module';
import { FileModule } from './modules/file/file.module';
import { SharedModule, GlobalRpcExceptionFilter } from '@server/shared';

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
    FileModule,
  ],
  controllers: [
    // NATS Handlers (not HTTP controllers)
    PollsHandler,
    RoomHandler,
    WaitingRoomHandler,
    WebhookHandler,
    UserHandler,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class MeetModule { }
