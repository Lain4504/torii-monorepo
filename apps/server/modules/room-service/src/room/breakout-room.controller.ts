import { MessagePattern, Payload } from "@nestjs/microservices";
import type {
    CreateBreakoutRoomsReq,
    EndBreakoutRoomReq,
    JoinBreakoutRoomReq,
    IncreaseBreakoutRoomDurationReq,
    BroadcastBreakoutRoomMsgReq,
} from "@workspace/protocol";
import { BreakoutRoomService } from "./breakout-room.service";
import { Controller } from "@nestjs/common";

@Controller()
export class BreakoutRoomController {
    constructor(
        private readonly breakoutRoomService: BreakoutRoomService,
    ) { }

    @MessagePattern({ cmd: 'breakout.create' })
    async createBreakoutRooms(@Payload() data: CreateBreakoutRoomsReq) {
        return this.breakoutRoomService.createBreakoutRooms(data);
    }

    @MessagePattern({ cmd: 'breakout.join' })
    async joinBreakoutRoom(@Payload() data: JoinBreakoutRoomReq) {
        return this.breakoutRoomService.joinBreakoutRoom(data);
    }

    @MessagePattern({ cmd: 'breakout.list' })
    async listBreakoutRooms(@Payload() data: { roomId: string }) {
        return this.breakoutRoomService.getBreakoutRooms(data);
    }

    @MessagePattern({ cmd: 'breakout.myRooms' })
    async getMyBreakoutRooms(@Payload() data: { roomId: string; userId: string }) {
        return this.breakoutRoomService.getMyBreakoutRooms(data);
    }

    @MessagePattern({ cmd: 'breakout.increaseDuration' })
    async increaseBreakoutRoomDuration(@Payload() data: IncreaseBreakoutRoomDurationReq) {
        return this.breakoutRoomService.increaseBreakoutRoomDuration(data);
    }

    @MessagePattern({ cmd: 'breakout.sendMsg' })
    async sendBreakoutRoomMsg(@Payload() data: BroadcastBreakoutRoomMsgReq) {
        return this.breakoutRoomService.sendBreakoutRoomMsg(data);
    }

    @MessagePattern({ cmd: 'breakout.endRoom' })
    async endBreakoutRoom(@Payload() data: EndBreakoutRoomReq) {
        return this.breakoutRoomService.endBreakoutRoom(data);
    }

    @MessagePattern({ cmd: 'breakout.endAllRooms' })
    async endAllBreakoutRooms(@Payload() data: { roomId: string }) {
        return this.breakoutRoomService.endAllBreakoutRooms(data);
    }
}