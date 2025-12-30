import { Module } from '@nestjs/common';
import { RoomApiController, RoomController } from './room.controller';
import { AuthRoomController } from './auth-room.controller';
import { WebhookController } from './webhook.controller';
import { NatsClientModule, SharedModule } from '@server/shared';
import {PollsController} from "./polls.controller";
import {UserRoomSettingController} from "./user-room-setting-controller";

@Module({
  imports: [
    NatsClientModule,
    SharedModule,
  ],
  controllers: [
    RoomController,
    RoomApiController,
    AuthRoomController,
    UserRoomSettingController,
    WebhookController,
    PollsController
  ],
})
export class RoomModule { }
