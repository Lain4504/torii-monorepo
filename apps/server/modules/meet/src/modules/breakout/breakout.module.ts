import { Module } from '@nestjs/common';
import { BreakoutService } from './breakout.service';
import { BreakoutNatsController } from './breakout.nats.controller';
import { SharedModule } from '@server/shared';
import { RoomModule } from '../room/room.module';
import { NatsService } from '../../interfaces/nats/nats.service';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import { NatsUserService } from '../../interfaces/nats/nats-user.service';
import { NatsUserInfoService } from '../../interfaces/nats/nats-user-info.service';
import { NatsStreamService } from '../../interfaces/nats/nats-stream.service';
import { NatsCacheService } from '../../interfaces/nats/nats-cache.service';
import { LiveKitService } from '../../infrastructure/livekit/livekit.service';

@Module({
    imports: [
        SharedModule,
        RoomModule
    ],
    controllers: [BreakoutNatsController],
    providers: [
        BreakoutService,
        // Provide NATS services that are needed if not exported by RoomModule (or if RoomModule exports them, we can just use them)
        // Check RoomModule exports: RoomInfoService, RoomCreateService, RoomEndService, RoomModifyService, RoomUserService, RoomDurationService
        // But also exports PollsService, AnalyticsService, WaitingRoomService, LiveKitService
        // It DOES NOT export NatsRoomService, NatsSystemEventsService etc. directly in 'exports' array shown in previous turn.
        // Wait, I checked RoomModule in previous turn (Step 1180):
        // It exports: RoomInfoService, RoomCreateService, RoomEndService, RoomModifyService, RoomUserService, RoomDurationService, PollsService, AnalyticsService, WaitingRoomService, LiveKitService
        // It DOES NOT export Nats* services. 
        // So we must provide them here or import a NatsModule if one exists.
        // Currently there is no separate NatsModule, they are provided in RoomModule or MeetModule.
        // To avoid duplication, we should probably import Nats services here too since they are in 'interfaces' folder.
        NatsService,
        NatsRoomService,
        NatsSystemEventsService,
        NatsUserService,
        NatsUserInfoService,
        NatsStreamService,
        NatsCacheService,
        LiveKitService
    ],
    exports: [BreakoutService]
})
export class BreakoutModule { }
