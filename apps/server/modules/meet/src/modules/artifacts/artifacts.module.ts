/**
 * Artifacts Module
 */

import { Module, forwardRef } from '@nestjs/common';
import { ArtifactsService } from './artifacts.service';
import { ArtifactsHandler } from '../../interfaces/nats/artifacts.handler';
import { SharedModule } from '@server/shared';
import { WebhookModule } from '../../infrastructure/webhook/webhook.module';

import { NatsModule } from '../../interfaces/nats/nats.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';

@Module({
    imports: [SharedModule, forwardRef(() => WebhookModule), NatsModule, RedisModule],
    controllers: [ArtifactsHandler],
    providers: [ArtifactsService],
    exports: [ArtifactsService],
})
export class ArtifactsModule { }
