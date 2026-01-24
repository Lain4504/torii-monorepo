import { Module } from '@nestjs/common';
import { ExternalDisplayService } from './external-display.service';
import { ExternalDisplayNatsController } from './external-display.nats.controller';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';

@Module({
    imports: [AnalyticsModule, SharedModule, RoomModule],
    controllers: [ExternalDisplayNatsController],
    providers: [ExternalDisplayService],
    exports: [ExternalDisplayService],
})
export class ExternalDisplayModule { }
