import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { SharedModule } from '@server/shared';

@Module({
    imports: [SharedModule],
    controllers: [RoomController],
    providers: [RoomService],
})
export class RoomModule { }
