import { Module } from '@nestjs/common';
import { ExternalMediaService } from './external-media.service';
import { ExternalMediaNatsController } from './external-media.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';

@Module({
    imports: [
        SharedModule,
        RoomModule
    ],
    controllers: [ExternalMediaNatsController],
    providers: [
        ExternalMediaService,
    ],
    exports: [ExternalMediaService]
})
export class ExternalMediaModule { }
