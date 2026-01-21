/**
 * Webhook Module
 */

import { Module, forwardRef } from '@nestjs/common';
import { WebhookNotifierService } from './webhook-notifier.service';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { SharedModule } from '@server/shared';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsCacheService } from '../../interfaces/nats/nats-cache.service';
import { NatsStreamService } from '../../interfaces/nats/nats-stream.service';
import { NatsUserInfoService } from '../../interfaces/nats/nats-user-info.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { RedisRoomService } from '../redis/redis-room.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';
import { WajlcAuthService } from '../../modules/auth/wajlc-auth.service';
import { AnalyticsModule } from '../../modules/analytics/analytics.module';
import { RoomModule } from '../../modules/room/room.module';

@Module({
    imports: [SharedModule, forwardRef(() => AnalyticsModule), forwardRef(() => RoomModule)],
    controllers: [WebhookController],
    providers: [
        // NATS base
        NatsCacheService,
        NatsService,
        NatsStreamService,
        NatsUserInfoService,

        // For NatsSystemEventsService
        LiveKitService,
        WajlcAuthService,
        NatsSystemEventsService,

        // NATS user & room
        NatsUserService,
        NatsRoomService,
        NatsRoomEventsService,

        // Redis
        RedisRoomService,

        // Webhook services
        WebhookNotifierService,
        WebhookService,
    ],
    exports: [WebhookNotifierService, WebhookService],
})
export class WebhookModule { }
