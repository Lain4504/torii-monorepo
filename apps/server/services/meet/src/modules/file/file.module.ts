import { Module, forwardRef } from '@nestjs/common';
import { FileService } from './file.service';
import { FileNatsController } from './file.nats.controller';
import { SharedModule } from '@server/shared';
import { NatsRoomService } from '@server/meet/services/nats-room.service';
import { NatsRoomEventsService } from '@server/meet/services/nats-room-events.service';
import { NatsService } from '@server/meet/services/nats.service';
import { NatsCacheService } from '@server/meet/services/nats-cache.service';
import { NatsStreamService } from '@server/meet/services/nats-stream.service';
import { NatsUserService } from '@server/meet/services/nats-user.service';
import { NatsUserInfoService } from '@server/meet/services/nats-user-info.service';
import { NatsSystemEventsService } from '@server/meet/services/nats-system-events.service';
import { LiveKitService } from '@server/meet/infrastructure/livekit/livekit.service';
import { AnalyticsModule } from '@server/meet/modules/analytics/analytics.module';
import { WajlcAuthService } from '@server/meet/modules/auth/wajlc-auth.service';

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
export class FileModule {}
