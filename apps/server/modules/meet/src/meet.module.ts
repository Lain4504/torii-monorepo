import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { RoomModule } from './modules/room/room.module';
import { FileModule } from './modules/file/file.module';
import { ArtifactsModule } from './modules/artifacts/artifacts.module';
import { WebhookModule } from './infrastructure/webhook/webhook.module';

// NATS Handlers (replacing HTTP controllers)
import { PollsHandler } from './interfaces/nats/polls.handler';
import { RoomHandler } from './interfaces/nats/room.handler';
import { WaitingRoomHandler } from './interfaces/nats/waiting-room.handler';
import { WebhookHandler } from './interfaces/nats/webhook.handler';
import { UserHandler } from './interfaces/nats/user.handler';
import { ArtifactsHandler } from './interfaces/nats/artifacts.handler';
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
import { IngressHandler } from './interfaces/nats/ingress.handler';
import { InsightsHandler } from './interfaces/nats/insights.handler';
import { SpeechToTextHandler } from './interfaces/nats/speech-to-text.handler';

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
