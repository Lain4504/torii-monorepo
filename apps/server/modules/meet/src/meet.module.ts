import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { RoomModule } from './modules/room/room.module';
import { FileModule } from './modules/file/file.module';
import { ArtifactsModule } from './modules/artifacts/artifacts.module';
import { WebhookModule } from './infrastructure/webhook/webhook.module';
import { SharedModule, GlobalRpcExceptionFilter } from '@server/shared';

// NATS Handlers (replacing HTTP controllers)
import { PollsHandler } from './interfaces/nats/polls.handler';
import { RoomHandler } from './interfaces/nats/room.handler';
import { WaitingRoomHandler } from './interfaces/nats/waiting-room.handler';
import { WebhookHandler } from './interfaces/nats/webhook.handler';
import { UserHandler } from './interfaces/nats/user.handler';
import { ArtifactsHandler } from './interfaces/nats/artifacts.handler';
import { BreakoutModule } from './modules/breakout/breakout.module';
import { EtherpadModule } from './modules/etherpad/etherpad.module';
import { ExternalMediaModule } from './modules/external-media/external-media.module';
import { ExternalDisplayModule } from './modules/external-display/external-display.module';
import { RecordingModule } from './modules/recording/recording.module';
import { PollsModule } from './modules/polls/polls.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../.env', // Load from monorepo root
    }),
    SharedModule,
    RoomModule,
    FileModule,
    PollsModule,
    AnalyticsModule,
    BreakoutModule,
    EtherpadModule,
    ExternalMediaModule,
    ExternalDisplayModule,
    RecordingModule,
    ArtifactsModule,
    WebhookModule,
  ],
  controllers: [
    // NATS Handlers (not HTTP controllers)
    PollsHandler,
    RoomHandler,
    WaitingRoomHandler,
    WebhookHandler,
    UserHandler,
    ArtifactsHandler,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class MeetModule { }
