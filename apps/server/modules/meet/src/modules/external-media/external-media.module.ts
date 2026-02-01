import { Module, forwardRef } from '@nestjs/common';
import { ExternalMediaService } from './external-media.service';
import { ExternalMediaNatsController } from './external-media.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => RoomModule),
        forwardRef(() => AnalyticsModule),
    ],
    controllers: [ExternalMediaNatsController],
    providers: [
        ExternalMediaService,
    ],
    exports: [ExternalMediaService]
})
export class ExternalMediaModule { }
