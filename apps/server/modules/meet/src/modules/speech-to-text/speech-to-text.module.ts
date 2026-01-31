/**
 * Speech To Text Module
 */

import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { RedisSpeechToTextService } from '../../infrastructure/redis/redis-speech-to-text.service';
import { NatsModule } from '../../interfaces/nats/nats.module';
import { WebhookModule } from '../../infrastructure/webhook/webhook.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SharedModule } from '@server/shared';

@Module({
    imports: [SharedModule, NatsModule, WebhookModule, AnalyticsModule],
    providers: [SpeechToTextService, RedisSpeechToTextService],
    exports: [SpeechToTextService, RedisSpeechToTextService],
})
export class SpeechToTextModule { }
