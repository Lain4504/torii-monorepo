/**
 * Artifacts Module
 */

import { Module, forwardRef } from '@nestjs/common';
import { ArtifactsService } from './artifacts.service';
import { ArtifactsHandler } from '../../interfaces/nats/artifacts.handler';
import { SharedModule } from '@server/shared';
import { WebhookModule } from '../../infrastructure/webhook/webhook.module';

@Module({
    imports: [SharedModule, forwardRef(() => WebhookModule)],
    controllers: [ArtifactsHandler],
    providers: [ArtifactsService],
    exports: [ArtifactsService],
})
export class ArtifactsModule { }
