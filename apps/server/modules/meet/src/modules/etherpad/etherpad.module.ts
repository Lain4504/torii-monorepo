import { Module, forwardRef } from '@nestjs/common';
import { EtherpadService } from './etherpad.service';
import { EtherpadNatsController } from './etherpad.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => RoomModule)
    ],
    controllers: [EtherpadNatsController],
    providers: [
        EtherpadService,
    ],
    exports: [EtherpadService]
})
export class EtherpadModule { }
