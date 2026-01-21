/**
 * Artifacts Module
 */

import { Module } from '@nestjs/common';
import { ArtifactsService } from './artifacts.service';
import { ArtifactsHandler } from '../../interfaces/nats/artifacts.handler';
import { SharedModule } from '@server/shared';
import { WebhookModule } from '../../infrastructure/webhook/webhook.module';

@Module({
    imports: [SharedModule, WebhookModule],
    controllers: [ArtifactsHandler],
    providers: [ArtifactsService],
    exports: [ArtifactsService],
})
export class ArtifactsModule { }
