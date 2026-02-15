import { Module, forwardRef } from '@nestjs/common';
import { ExternalMediaService } from './external-media.service';
import { ExternalMediaNatsController } from './external-media.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '@server/meet/modules/room/room.module';
import { NatsService } from '@server/meet/interfaces/nats/nats.service';
import { NatsRoomService } from '@server/meet/interfaces/nats/nats-room.service';
import { NatsUserService } from '@server/meet/interfaces/nats/nats-user.service';
import { NatsSystemEventsService } from '@server/meet/interfaces/nats/nats-system-events.service';
import { AnalyticsModule } from '@server/meet/modules/analytics/analytics.module';

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
