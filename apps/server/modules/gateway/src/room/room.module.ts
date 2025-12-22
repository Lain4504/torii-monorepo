import { Module } from '@nestjs/common';
import { RoomApiController, RoomController } from './room.controller';
import { WebhookController } from './webhook.controller';
import { PollsController } from './polls.controller';
import { NatsClientModule, SharedModule } from '@server/shared';
import { BreakoutRoomController } from './breakout-room.controller';
import { WaitingRoomController } from './waiting-room.controller';
import { IngressController } from './ingress.controller';
import { UserTrackingModule } from '../user-tracking.module';
import { UserController } from './user.controller';
import { FileController } from './file.controller';
import { ExternalMediaController } from './external-media.controller';
import { ArtifactController, ArtifactDownloadController } from './artifact.controller';

@Module({
  imports: [
    NatsClientModule,
    SharedModule,
    UserTrackingModule,
  ],
  controllers: [
    RoomController,
    WebhookController,
    PollsController,
    BreakoutRoomController,
    WaitingRoomController,
    IngressController,
    UserController,
    FileController,
    ExternalMediaController,
    RoomApiController,
    ArtifactController,
    ArtifactDownloadController,
  ],
})
export class RoomModule { }
