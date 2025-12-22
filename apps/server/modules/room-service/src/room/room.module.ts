import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';

// Controllers
import { RoomController } from './room.controller';
import { PollController } from './poll.controller';
import { BreakoutRoomController } from './breakout-room.controller';
import { WaitingRoomController } from './waiting-room.controller';
import { UserController } from './user.controller';
import { FileController } from './file.controller';
import { ExternalMediaController } from './external-media.controller';

// Services
import { RoomService } from './room.service';
import { PollService } from './poll.service';
import { BreakoutRoomService } from './breakout-room.service';
import { WaitingRoomService } from './waiting-room.service';
import { UserService } from './user.service';
import { FileService } from './file.service';
import { ExternalMediaService } from './external-media.service';

// Other services
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsController } from '../analytics/analytics.controller';
import { WebhookService } from '../webhook/webhook.service';

@Module({
  imports: [SharedModule],
  controllers: [
    RoomController,
    PollController,
    BreakoutRoomController,
    WaitingRoomController,
    UserController,
    FileController,
    ExternalMediaController,
    AnalyticsController,
  ],
  providers: [
    RoomService,
    PollService,
    BreakoutRoomService,
    WaitingRoomService,
    UserService,
    FileService,
    ExternalMediaService,
    AnalyticsService,
    WebhookService,
  ],
  exports: [
    RoomService,
    PollService,
    BreakoutRoomService,
    WaitingRoomService,
    UserService,
    FileService,
    ExternalMediaService,
    AnalyticsService,
  ],
})
export class RoomModule { }

