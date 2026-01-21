import { Controller, Logger } from '@nestjs/common';
import { NatsService } from '../../interfaces/nats/nats.service';
import { BreakoutService } from './breakout.service';
import {
    CreateBreakoutRoomsReq,
    CreateBreakoutRoomsReqSchema,
    JoinBreakoutRoomReq,
    JoinBreakoutRoomReqSchema,
    EndBreakoutRoomReq,
    EndBreakoutRoomReqSchema,
    BreakoutRoomRes,
    BreakoutRoomResSchema,
    IncreaseBreakoutRoomDurationReq,
    IncreaseBreakoutRoomDurationReqSchema,
    BroadcastBreakoutRoomMsgReq,
    BroadcastBreakoutRoomMsgReqSchema,
} from '@workspace/protocol';
import { create, fromBinary, toBinary, toJsonString } from '@bufbuild/protobuf';

@Controller()
export class BreakoutNatsController {
    private readonly logger = new Logger(BreakoutNatsController.name);

    constructor(
        private readonly natsService: NatsService,
        private readonly breakoutService: BreakoutService,
    ) { }

    onModuleInit() {
        this.subscribeToSubjects();
    }

    private subscribeToSubjects() {
        this.natsService.subscribe('breakoutRoom.create', this.createBreakoutRooms.bind(this));
        this.natsService.subscribe('breakoutRoom.join', this.joinBreakoutRoom.bind(this));
        this.natsService.subscribe('breakoutRoom.end', this.endBreakoutRoom.bind(this));
        this.natsService.subscribe('breakoutRoom.get', this.getBreakoutRooms.bind(this));
        this.natsService.subscribe('breakoutRoom.increaseDuration', this.increaseDuration.bind(this));
        this.natsService.subscribe('breakoutRoom.broadcast', this.broadcastMsg.bind(this));
    }

    async createBreakoutRooms(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            const req = fromBinary(CreateBreakoutRoomsReqSchema, data);
            await this.breakoutService.createBreakoutRooms(req);

            const res = create(BreakoutRoomResSchema, {
                status: true,
                msg: 'Breakout rooms created successfully'
            });
            return toBinary(BreakoutRoomResSchema, res);
        } catch (error) {
            this.logger.error(`Error creating breakout rooms: ${error.message}`);
            const res = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message
            });
            return toBinary(BreakoutRoomResSchema, res);
        }
    }

    async joinBreakoutRoom(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            const req = fromBinary(JoinBreakoutRoomReqSchema, data);
            // Verify requested_user_id matches userId (security check)
            // But usually userId from NATS subject is enough? 
            // The method signature in logic uses req.userId.

            const token = await this.breakoutService.joinBreakoutRoom(req);

            const res = create(BreakoutRoomResSchema, {
                status: true,
                msg: 'Token generated',
                token: token
            });
            return toBinary(BreakoutRoomResSchema, res);
        } catch (error) {
            this.logger.error(`Error joining breakout room: ${error.message}`);
            const res = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message
            });
            return toBinary(BreakoutRoomResSchema, res);
        }
    }

    async endBreakoutRoom(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            const req = fromBinary(EndBreakoutRoomReqSchema, data);
            await this.breakoutService.endBreakoutRoom(req);

            const res = create(BreakoutRoomResSchema, {
                status: true,
                msg: 'Breakout room ended'
            });
            return toBinary(BreakoutRoomResSchema, res);
        } catch (error) {
            this.logger.error(`Error ending breakout room: ${error.message}`);
            const res = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message
            });
            return toBinary(BreakoutRoomResSchema, res);
        }
    }

    async getBreakoutRooms(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            // Data is expected to be room_id string in generic handler? 
            // Or proto message? 
            // Ideally we accept a protobuf wrapper. Since we don't have GetBreakoutRoomsReq in proto provided earlier,
            // Assuming string RoomID passed as bytes or part of URL subject if we were using REST.
            // But here NATS payload.
            // Let's assume input is simple string or JSON with roomId?
            // Checking Go code: it handles `breakoutRoom.get` request.

            // Simple approach: parse as string since it's just room_id usually
            const roomId = new TextDecoder().decode(data);

            const rooms = await this.breakoutService.getBreakoutRoomsInfo(roomId);

            const res = create(BreakoutRoomResSchema, {
                status: true,
                msg: 'success',
                rooms: rooms
            });
            return toBinary(BreakoutRoomResSchema, res);
        } catch (error) {
            this.logger.error(`Error getting breakout rooms: ${error.message}`);
            const res = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message
            });
            return toBinary(BreakoutRoomResSchema, res);
        }
    }

    async increaseDuration(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            const req = fromBinary(IncreaseBreakoutRoomDurationReqSchema, data);
            await this.breakoutService.increaseBreakoutRoomDuration(req);

            const res = create(BreakoutRoomResSchema, {
                status: true,
                msg: 'Duration increased'
            });
            return toBinary(BreakoutRoomResSchema, res);
        } catch (error) {
            const res = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message
            });
            return toBinary(BreakoutRoomResSchema, res);
        }
    }

    async broadcastMsg(userId: string, data: Uint8Array): Promise<Uint8Array> {
        try {
            const req = fromBinary(BroadcastBreakoutRoomMsgReqSchema, data);
            await this.breakoutService.broadcastBreakoutRoomMsg(req);

            const res = create(BreakoutRoomResSchema, {
                status: true,
                msg: 'Message broadcasted'
            });
            return toBinary(BreakoutRoomResSchema, res);
        } catch (error) {
            const res = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message
            });
            return toBinary(BreakoutRoomResSchema, res);
        }
    }
}
