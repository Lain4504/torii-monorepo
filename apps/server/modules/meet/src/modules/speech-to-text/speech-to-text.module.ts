/**
 * Speech To Text Module
 */

import { Module, forwardRef } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { RedisSpeechToTextService } from '@server/meet/infrastructure/redis/redis-speech-to-text.service';
import { NatsModule } from '@server/meet/interfaces/nats/nats.module';
import { WebhookModule } from '@server/meet/infrastructure/webhook/webhook.module';
import { AnalyticsModule } from '@server/meet/modules/analytics/analytics.module';
import { SharedModule } from '@server/shared';

@Module({
    imports: [SharedModule, NatsModule, forwardRef(() => WebhookModule), forwardRef(() => AnalyticsModule)],
    providers: [SpeechToTextService, RedisSpeechToTextService],
    exports: [SpeechToTextService, RedisSpeechToTextService],
})
export class SpeechToTextModule { }
