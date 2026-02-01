import { Module, forwardRef } from '@nestjs/common';
import { FileService } from './file.service';
import { FileNatsController } from './file.nats.controller';
import { SharedModule } from '@server/shared';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsCacheService } from '../../interfaces/nats/nats-cache.service';
import { NatsStreamService } from '../../interfaces/nats/nats-stream.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsUserInfoService } from '../../interfaces/nats/nats-user-info.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { WajlcAuthService } from '../auth/wajlc-auth.service';

@Module({
    imports: [SharedModule, forwardRef(() => AnalyticsModule)],
    providers: [
        FileService,
        NatsService,
        NatsCacheService,
        NatsStreamService,
        NatsUserInfoService,
        LiveKitService,
        WajlcAuthService,
        NatsSystemEventsService,
        NatsUserService,
        NatsRoomService,
        NatsRoomEventsService,
    ],
    controllers: [FileNatsController],
    exports: [FileService],
})
export class FileModule { }
