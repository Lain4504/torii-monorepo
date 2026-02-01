/**
 * Webhook Module
 */

import { Module, forwardRef } from '@nestjs/common';
import { WebhookNotifierService } from './webhook-notifier.service';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { SharedModule } from '@server/shared';
import { RedisRoomService } from '../redis/redis-room.service';
import { AnalyticsModule } from '../../modules/analytics/analytics.module';
import { RoomModule } from '../../modules/room/room.module';
import { SpeechToTextModule } from '../../modules/speech-to-text/speech-to-text.module';
import { NatsModule } from '../../interfaces/nats/nats.module';
import { LiveKitModule } from '../livekit/livekit.module';
import { WajlcAuthModule } from '../../modules/auth/wajlc-auth.module';
import { BreakoutModule } from '../../modules/breakout/breakout.module';

@Module({
    imports: [
        SharedModule,
        forwardRef(() => AnalyticsModule),
        forwardRef(() => RoomModule),
        forwardRef(() => SpeechToTextModule),
        forwardRef(() => NatsModule),
        forwardRef(() => BreakoutModule),
        LiveKitModule,
        WajlcAuthModule,
    ],
    controllers: [WebhookController],
    providers: [
        // Redis
        RedisRoomService,

        // Webhook services
        WebhookNotifierService,
        WebhookService,
    ],
    exports: [WebhookNotifierService, WebhookService],
})
export class WebhookModule { }
