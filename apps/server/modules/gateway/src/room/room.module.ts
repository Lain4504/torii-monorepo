import { Module } from '@nestjs/common';
import { RoomApiController, RoomController } from './room.controller';
import { AuthRoomController, UserApiController } from './auth-room.controller';
import { WebhookController } from '../webhook/webhook.controller';
import { NatsClientModule, SharedModule } from '@server/shared';

@Module({
  imports: [
    NatsClientModule,
    SharedModule,
  ],
  controllers: [
    RoomController,
    RoomApiController,
    AuthRoomController,
    UserApiController,
    WebhookController,
  ],
})
export class RoomModule { }
