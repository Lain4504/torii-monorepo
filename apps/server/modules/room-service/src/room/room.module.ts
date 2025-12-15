import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { SharedModule } from '@server/shared';

import { BreakoutRoomService } from './breakout-room.service';

@Module({
    imports: [SharedModule],
    controllers: [RoomController],
    providers: [RoomService, BreakoutRoomService],
})
export class RoomModule { }
