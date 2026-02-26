import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { RoomModule } from './modules/room/room.module';
import { FileModule } from './modules/file/file.module';
import { ArtifactsModule } from './modules/artifacts/artifacts.module';
import { WebhookModule } from './infrastructure/webhook/webhook.module';

// NATS Handlers (replacing HTTP controllers)
import { PollsHandler } from './handlers/polls.handler';
import { RoomHandler } from './handlers/room.handler';
import { WaitingRoomHandler } from './handlers/waiting-room.handler';
import { WebhookHandler } from './handlers/webhook.handler';
import { UserHandler } from './handlers/user.handler';
import { ArtifactsHandler } from './handlers/artifacts.handler';
import { BreakoutModule } from './modules/breakout/breakout.module';
import { ExternalMediaModule } from './modules/external-media/external-media.module';
import { ExternalDisplayModule } from './modules/external-display/external-display.module';
import { RecordingModule } from './modules/recording/recording.module';
import { PollsModule } from './modules/polls/polls.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { IngressModule } from './modules/ingress/ingress.module';
import { InsightsModule } from './modules/insights/insights.module';
import { SpeechToTextModule } from './modules/speech-to-text/speech-to-text.module';
import { JanitorModule } from './modules/janitor/janitor.module';

// NATS Handlers
import { IngressHandler } from './handlers/ingress.handler';
import { InsightsHandler } from './handlers/insights.handler';
import { SpeechToTextHandler } from './handlers/speech-to-text.handler';

import { SharedModule, GlobalRpcExceptionFilter } from '@server/shared';

@Module({
  imports: [
    SharedModule,
    RoomModule,
    FileModule,
    PollsModule,
    AnalyticsModule,
    BreakoutModule,

    ExternalMediaModule,
    ExternalDisplayModule,
    RecordingModule,
    ArtifactsModule,
    WebhookModule,
    IngressModule,
    InsightsModule,
    SpeechToTextModule,
    JanitorModule,
  ],
  controllers: [
    // NATS Handlers (not HTTP controllers)
    PollsHandler,
    RoomHandler,
    WaitingRoomHandler,
    WebhookHandler,
    UserHandler,
    ArtifactsHandler,
    IngressHandler,
    InsightsHandler,
    SpeechToTextHandler,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class MeetModule { }
