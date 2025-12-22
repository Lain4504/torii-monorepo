import {
    Body,
    Controller,
    Get,
    HttpCode,
    Inject,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type {
    CreateBreakoutRoomsReq,
    JoinBreakoutRoomReq,
    IncreaseBreakoutRoomDurationReq,
    BroadcastBreakoutRoomMsgReq,
    EndBreakoutRoomReq,
} from '@workspace/protocol';
import {
    CreateBreakoutRoomsReqSchema,
    JoinBreakoutRoomReqSchema,
    IncreaseBreakoutRoomDurationReqSchema,
    BroadcastBreakoutRoomMsgReqSchema,
    EndBreakoutRoomReqSchema,
} from '@workspace/protocol';
import { fromBinary } from '@bufbuild/protobuf';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api/breakoutRoom')
@UseGuards(JwtAuthGuard)
export class BreakoutRoomController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    private decode<T>(req: any, body: any, schema: any): T {
        const raw = req?.body;
        if (raw && Buffer.isBuffer(raw) && raw.length > 0) {
            try {
                return fromBinary(schema, raw) as T;
            } catch { /* fall back */ }
        }
        return body as T;
    }

    private getAuthContext(req: any) {
        const user = req.user || {};
        const roomId = user.room_id || user.room || user.video?.room;
        const userId = user.user_id || user.userId || user.sub;
        const isAdmin = user.is_admin ?? user.isAdmin ?? user.metadata?.is_admin ?? user.metadata?.isAdmin ?? false;
        return { roomId, userId, isAdmin };
    }

    @Post('create')
    @HttpCode(200)
    async create(@Body() body: CreateBreakoutRoomsReq, @Req() req: any) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<CreateBreakoutRoomsReq>(req, body, CreateBreakoutRoomsReqSchema);
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.create' }, {
            ...parsed,
            roomId,
            requestedUserId: userId,
        }));
    }

    @Post('join')
    @HttpCode(200)
    async join(@Body() body: JoinBreakoutRoomReq, @Req() req: any) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };
        if (!userId) return { status: false, msg: 'userId required' };

        const parsed = this.decode<JoinBreakoutRoomReq>(req, body, JoinBreakoutRoomReqSchema);
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.join' }, {
            ...parsed,
            roomId,
            userId,
            isAdmin,
        }));
    }

    @Get('listRooms')
    async listRooms(@Req() req: any) {
        const { roomId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.list' }, { roomId }));
    }

    @Get('myRooms')
    async myRooms(@Req() req: any) {
        const { roomId, userId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };
        if (!userId) return { status: false, msg: 'userId required' };
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.myRooms' }, { roomId, userId }));
    }

    @Post('increaseDuration')
    @HttpCode(200)
    async increaseDuration(@Body() body: IncreaseBreakoutRoomDurationReq, @Req() req: any) {
        const { roomId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<IncreaseBreakoutRoomDurationReq>(req, body, IncreaseBreakoutRoomDurationReqSchema);
        return firstValueFrom(
            this.natsClient.send({ cmd: 'breakout.increaseDuration' }, { ...parsed, roomId }),
        );
    }

    @Post('sendMsg')
    @HttpCode(200)
    async sendMsg(@Body() body: BroadcastBreakoutRoomMsgReq, @Req() req: any) {
        const { roomId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<BroadcastBreakoutRoomMsgReq>(req, body, BroadcastBreakoutRoomMsgReqSchema);
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.sendMsg' }, { ...parsed, roomId }));
    }

    @Post('endRoom')
    @HttpCode(200)
    async endRoom(@Body() body: EndBreakoutRoomReq, @Req() req: any) {
        const { roomId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<EndBreakoutRoomReq>(req, body, EndBreakoutRoomReqSchema);
        return firstValueFrom(this.natsClient.send({ cmd: 'breakout.endRoom' }, { ...parsed, roomId }));
    }

    @Post('endAllRooms')
    @HttpCode(200)
    async endAllRooms(@Req() req: any) {
        const { roomId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        return firstValueFrom(
            this.natsClient.send({ cmd: 'breakout.endAllRooms' }, { roomId }),
        );
    }
}
