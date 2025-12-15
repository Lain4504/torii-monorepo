import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoomService } from './room.service';

@Controller()
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @MessagePattern({ cmd: 'room.create' })
    create(@Payload() data: { roomName: string; emptyTimeout?: number; maxParticipants?: number }) {
        return this.roomService.createRoom(data);
    }

    @MessagePattern({ cmd: 'room.end' })
    end(@Payload() data: { roomName: string }) {
        return this.roomService.endRoom(data);
    }

    @MessagePattern({ cmd: 'room.status' })
    status(@Payload() data: { roomName: string }) {
        return this.roomService.getRoomStatus(data);
    }

    @MessagePattern({ cmd: 'room.list' })
    list() {
        return this.roomService.listRooms();
    }
}
