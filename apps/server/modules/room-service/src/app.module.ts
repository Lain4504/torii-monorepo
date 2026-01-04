import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './room/room.module';
import { SharedModule } from '@server/shared';

// HTTP Controllers
import { RoomController, RoomApiController } from './interfaces/http/room.controller';
import { AuthRoomController } from './interfaces/http/auth-room.controller';
import { PollsController } from './interfaces/http/polls.controller';
import { WebhookController } from './interfaces/http/webhook.controller';
import { WaitingRoomController } from './interfaces/http/waiting-room.controller';
import { UserRoomSettingController } from './interfaces/http/user-room-setting.controller';

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
    // HTTP Controllers
    RoomController,
    RoomApiController,
    AuthRoomController,
    PollsController,
    WebhookController,
    WaitingRoomController,
    UserRoomSettingController,
  ],
})
export class RoomServiceModule {}

