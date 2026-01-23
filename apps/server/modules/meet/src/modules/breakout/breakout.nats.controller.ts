import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BreakoutService } from './breakout.service';
import {
    CreateBreakoutRoomsReq,
    JoinBreakoutRoomReq,
    EndBreakoutRoomReq,
    IncreaseBreakoutRoomDurationReq,
    BroadcastBreakoutRoomMsgReq,
} from '@workspace/protocol';

@Controller()
export class BreakoutNatsController {
    private readonly logger = new Logger(BreakoutNatsController.name);

    constructor(
        private readonly breakoutService: BreakoutService,
    ) { }

    @MessagePattern({ cmd: 'breakout.create' })
    async createBreakoutRooms(@Payload() data: CreateBreakoutRoomsReq) {
        try {
            await this.breakoutService.createBreakoutRooms(data);
            return {
                status: true,
                msg: 'Breakout rooms created successfully'
            };
        } catch (error) {
            this.logger.error(`Error creating breakout rooms: ${error.message}`);
            return {
                status: false,
                msg: error.message
            };
        }
    }

    @MessagePattern({ cmd: 'breakout.join' })
    async joinBreakoutRoom(@Payload() data: JoinBreakoutRoomReq) {
        try {
            const token = await this.breakoutService.joinBreakoutRoom(data);
            return {
                status: true,
                msg: 'Token generated',
                token: token
            };
        } catch (error) {
            this.logger.error(`Error joining breakout room: ${error.message}`);
            return {
                status: false,
                msg: error.message
            };
        }
    }

    @MessagePattern({ cmd: 'breakout.end' })
    async endBreakoutRoom(@Payload() data: EndBreakoutRoomReq) {
        try {
            await this.breakoutService.endBreakoutRoom(data);
            return {
                status: true,
                msg: 'Breakout room ended'
            };
        } catch (error) {
            this.logger.error(`Error ending breakout room: ${error.message}`);
            return {
                status: false,
                msg: error.message
            };
        }
    }

    @MessagePattern({ cmd: 'breakout.get' })
    async getBreakoutRooms(@Payload() roomId: string) {
        try {
            const rId = (typeof roomId === 'object' && (roomId as any).roomId) ? (roomId as any).roomId : roomId;
            const rooms = await this.breakoutService.getBreakoutRoomsInfo(rId);
            return {
                status: true,
                msg: 'success',
                rooms: rooms
            };
        } catch (error) {
            this.logger.error(`Error getting breakout rooms: ${error.message}`);
            return {
                status: false,
                msg: error.message
            };
        }
    }

    @MessagePattern({ cmd: 'breakout.increaseDuration' })
    async increaseDuration(@Payload() data: IncreaseBreakoutRoomDurationReq) {
        try {
            await this.breakoutService.increaseBreakoutRoomDuration(data);
            return {
                status: true,
                msg: 'Duration increased'
            };
        } catch (error) {
            return {
                status: false,
                msg: error.message
            };
        }
    }

    @MessagePattern({ cmd: 'breakout.broadcast' })
    async broadcastMsg(@Payload() data: BroadcastBreakoutRoomMsgReq) {
        try {
            await this.breakoutService.broadcastBreakoutRoomMsg(data);
            return {
                status: true,
                msg: 'Message broadcasted'
            };
        } catch (error) {
            return {
                status: false,
                msg: error.message
            };
        }
    }

    @MessagePattern({ cmd: 'breakout.my' })
    async getMyBreakoutRoom(@Payload() data: { roomId: string; userId: string }) {
        try {
            const result = await this.breakoutService.getMyBreakoutRoom(data.roomId, data.userId);
            return {
                status: true,
                msg: 'success',
                room: result
            };
        } catch (error) {
            this.logger.error(`Error getting my breakout room: ${error.message}`);
            return {
                status: false,
                msg: error.message
            };
        }
    }

    @MessagePattern({ cmd: 'breakout.endAll' })
    async endAllBreakoutRooms(@Payload() roomId: string) {
        try {
            const rId = (typeof roomId === 'object' && (roomId as any).roomId) ? (roomId as any).roomId : roomId;
            await this.breakoutService.endAllBreakoutRooms(rId);
            return {
                status: true,
                msg: 'success'
            };
        } catch (error) {
            this.logger.error(`Error ending all breakout rooms: ${error.message}`);
            return {
                status: false,
                msg: error.message
            };
        }
    }
}
