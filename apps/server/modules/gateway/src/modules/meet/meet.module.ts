import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';

// Controllers
import { AuthRoomController } from './controllers/auth-room.controller';
import { PollsController } from './controllers/polls.controller';
import { RoomController, RoomApiController } from './controllers/room.controller';
import { UserRoomSettingController } from './controllers/user-room-setting.controller';
import { WaitingRoomController } from './controllers/waiting-room.controller';
import { WebhookController } from './controllers/webhook.controller';

/**
 * Meet Module for Gateway
 * Handles all Meet service HTTP endpoints and routes to NATS
 */
@Module({
    imports: [NatsClientModule],
    controllers: [
        AuthRoomController,
        PollsController,
        RoomController,
        RoomApiController,
        UserRoomSettingController,
        WaitingRoomController,
        WebhookController,
    ],
})
export class MeetModule { }
