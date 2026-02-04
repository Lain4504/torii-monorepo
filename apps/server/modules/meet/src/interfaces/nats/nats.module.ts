/**
 * NATS Module
 *
 * Provides NATS general services and JetStream client
 */

import { Module, Global, forwardRef } from '@nestjs/common';
import { NatsService } from './nats.service';
import { NatsCacheService } from './nats-cache.service';
import { NatsRoomService } from './nats-room.service';
import { NatsRoomEventsService } from './nats-room-events.service';
import { NatsSystemEventsService } from './nats-system-events.service';
import { NatsStreamService } from './nats-stream.service';
import { NatsUserService } from './nats-user.service';
import { NatsUserInfoService } from './nats-user-info.service';
import { NatsAuthCalloutService } from './nats-auth-callout.service';
import { NatsConsumerService } from './nats-consumer.service';
import { NatsController } from './nats.controller';
import { AnalyticsModule } from '../../modules/analytics/analytics.module';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { WajlcAuthModule } from '../../modules/auth/wajlc-auth.module';
import { RoomModule } from '../../modules/room/room.module';

@Global()
@Module({
    imports: [
        forwardRef(() => AnalyticsModule),
        forwardRef(() => RoomModule),
        LiveKitModule,
        forwardRef(() => WajlcAuthModule),
    ],
    providers: [
        NatsService,
        NatsCacheService,
        NatsRoomService,
        NatsRoomEventsService,
        NatsSystemEventsService,
        NatsStreamService,
        NatsUserService,
        NatsUserInfoService,
        NatsAuthCalloutService,
        NatsConsumerService,
        NatsController,
    ],
    exports: [
        NatsService,
        NatsCacheService,
        NatsRoomService,
        NatsRoomEventsService,
        NatsSystemEventsService,
        NatsStreamService,
        NatsUserService,
        NatsUserInfoService,
        NatsAuthCalloutService,
        NatsConsumerService,
        NatsController,
    ],
})
export class NatsModule { }
