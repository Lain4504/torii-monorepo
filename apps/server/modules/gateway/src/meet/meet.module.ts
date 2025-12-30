import { Module } from '@nestjs/common';
import { RoomModule } from './room/room.module';
import { WaitingRoomModule } from './waiting-room/waiting-room.module';

@Module({
    imports: [
        RoomModule,
        WaitingRoomModule,
    ],
})
export class MeetGatewayModule { }
