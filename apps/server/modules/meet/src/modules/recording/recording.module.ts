import { Module, forwardRef } from '@nestjs/common';
import { RecordingService } from './recording.service';
import { RecordingNatsController } from './recording.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';
import { ArtifactsModule } from '../artifacts/artifacts.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { WebhookModule } from '../../infrastructure/webhook/webhook.module';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => RoomModule),
        ArtifactsModule,
        AnalyticsModule,
        forwardRef(() => WebhookModule),
    ],
    providers: [
        RecordingService,
        RecordingNatsController,
    ],
    controllers: [RecordingNatsController],
    exports: [RecordingService],
})
export class RecordingModule { }
