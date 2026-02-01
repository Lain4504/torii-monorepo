import { Module, forwardRef } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FileModule } from '../file/file.module';
import { WebhookModule } from '../../infrastructure/webhook/webhook.module';
import { ArtifactsModule } from '../artifacts/artifacts.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PollsModule } from '../polls/polls.module';
import { BreakoutModule } from '../breakout/breakout.module';
import { InsightsModule } from '../insights/insights.module';
import { RecordingModule } from '../recording/recording.module';
import { SpeechToTextModule } from '../speech-to-text/speech-to-text.module';

import { NatsModule } from '../../interfaces/nats/nats.module';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { WajlcAuthModule } from '../auth/wajlc-auth.module';

// Services
import { RoomCreateService } from './room-create.service';
import { RoomInfoService } from './room-info.service';
import { RoomModifyService } from './room-modify.service';
import { RoomEndService } from './room-end.service';
import { RoomDurationService } from './room-duration.service';
import { RoomUserService } from './room-user.service';
import { WaitingRoomService } from '../waiting-room/waiting-room.service';

// Redis Services
import { RedisLockService } from '../../infrastructure/redis/redis-lock.service';
import { RedisRoomService } from '../../infrastructure/redis/redis-room.service';

@Module({
  imports: [
    SharedModule,
    forwardRef(() => FileModule),
    forwardRef(() => WebhookModule),
    forwardRef(() => ArtifactsModule),
    forwardRef(() => AnalyticsModule),
    forwardRef(() => PollsModule),
    forwardRef(() => BreakoutModule),
    forwardRef(() => InsightsModule),
    forwardRef(() => RecordingModule),
    forwardRef(() => SpeechToTextModule),
    forwardRef(() => NatsModule),
    LiveKitModule,
    WajlcAuthModule,
  ],
  controllers: [],
  providers: [
    // Room services
    RoomCreateService,
    RoomInfoService,
    RoomModifyService,
    RoomEndService,
    RoomDurationService,
    RoomUserService,
    WaitingRoomService,

    // Redis services
    RedisLockService,
    RedisRoomService,
  ],
  exports: [
    RoomInfoService,
    RoomCreateService,
    RoomEndService,
    RoomModifyService,
    RoomUserService,
    RoomDurationService,
    WaitingRoomService,
  ],
})
export class RoomModule { }

