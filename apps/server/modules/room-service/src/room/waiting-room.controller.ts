import {MessagePattern, Payload} from "@nestjs/microservices";
import type {ApproveWaitingUsersReq, UpdateWaitingRoomMessageReq} from "@workspace/protocol";
import {WaitingRoomService} from "./waiting-room.service";
import {Controller} from "@nestjs/common";

@Controller()
export class WaitingRoomController{
    constructor(private readonly waitingRoomService: WaitingRoomService) {
    }
    @MessagePattern({cmd: 'waitingRoom.approve'})
    async approveWaitingUsersMsg(@Payload() data: ApproveWaitingUsersReq) {
        return this.waitingRoomService.approveWaitingUsers(data);
    }

    @MessagePattern({cmd: 'waitingRoom.updateMsg'})
    async updateWaitingRoomMsg(@Payload() data: UpdateWaitingRoomMessageReq) {
        return this.waitingRoomService.updateWaitingRoomMessage(data);
    }
}