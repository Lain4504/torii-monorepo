/**
 * Speech To Text Module
 */

import { Module } from '@nestjs/common';
import { SpeechToTextService } from './speech-to-text.service';
import { RedisSpeechToTextService } from '../../infrastructure/redis/redis-speech-to-text.service';
import { NatsModule } from '../../interfaces/nats/nats.module';

@Module({
    imports: [NatsModule],
    providers: [SpeechToTextService, RedisSpeechToTextService],
    exports: [SpeechToTextService, RedisSpeechToTextService],
})
export class SpeechToTextModule { }
