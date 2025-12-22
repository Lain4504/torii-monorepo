import {
    Body,
    Controller,
    Get,
    HttpCode,
    Inject,
    Post,
    Req,
    Res,
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
    BreakoutRoomRes,
} from '@workspace/protocol';
import {
    CreateBreakoutRoomsReqSchema,
    JoinBreakoutRoomReqSchema,
    IncreaseBreakoutRoomDurationReqSchema,
    BroadcastBreakoutRoomMsgReqSchema,
    EndBreakoutRoomReqSchema,
    BreakoutRoomResSchema,
} from '@workspace/protocol';
import { create, toBinary, fromBinary } from '@bufbuild/protobuf';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Response } from 'express';
import { BadRequestException } from '@nestjs/common';
import { ProtobufParserPipe } from '@server/shared';

@Controller('api/breakoutRoom')
@UseGuards(JwtAuthGuard)
export class BreakoutRoomController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    private decodeProto<T>(raw: any, schema: any): T {
        try {
            if (Buffer.isBuffer(raw)) {
                try { return fromBinary(schema, raw) as T; } catch { /* fall through */ }
                try { return JSON.parse(raw.toString('utf8')) as T; } catch { /* ignore */ }
            }
            if (raw && typeof raw === 'object' && raw.type === 'Buffer' && Array.isArray(raw.data)) {
                const buf = Buffer.from(raw.data);
                try { return fromBinary(schema, buf) as T; } catch { /* fall through */ }
                try { return JSON.parse(buf.toString('utf8')) as T; } catch { /* ignore */ }
            }
            if (Array.isArray(raw) && raw.every((v) => typeof v === 'number')) {
                const buf = Buffer.from(raw);
                try { return fromBinary(schema, buf) as T; } catch { /* fall through */ }
                try { return JSON.parse(buf.toString('utf8')) as T; } catch { /* ignore */ }
            }
            if (raw instanceof Uint8Array) {
                const buf = Buffer.from(raw);
                try { return fromBinary(schema, buf) as T; } catch { /* fall through */ }
                try { return JSON.parse(buf.toString('utf8')) as T; } catch { /* ignore */ }
            }
            if (typeof raw === 'string') {
                try {
                    const asBuf = Buffer.from(raw, 'base64');
                    if (asBuf.length > 0) return fromBinary(schema, asBuf) as T;
                } catch { /* ignore */ }
                try { return JSON.parse(raw) as T; } catch { /* ignore */ }
            }
        } catch { /* ignore */ }
        return raw as T;
    }

    private decodeFromReq<T>(req: any, fallbackBody: any, schema: any): T {
        const raw = req?.body ?? req?.rawBody;
        if (raw && Buffer.isBuffer(raw) && raw.length > 0) {
            try { return fromBinary(schema, raw) as T; } catch { /* fallback */ }
        }
        return this.decodeProto<T>(fallbackBody ?? raw, schema);
    }

    private getAuthContext(req: any) {
        const user = req.user || {};
        const roomId = user.room_id || user.room || user.video?.room;
        const userId = user.user_id || user.userId || user.sub;
        const isAdmin = user.is_admin ?? user.isAdmin ?? user.metadata?.is_admin ?? user.metadata?.isAdmin ?? false;
        return { roomId, userId, isAdmin };
    }

    private sendProto(res: Response, payload: any) {
        const message = create(BreakoutRoomResSchema, payload as BreakoutRoomRes);
        const buffer = toBinary(BreakoutRoomResSchema, message);
        res.setHeader('Content-Type', 'application/protobuf');
        res.status(200).send(Buffer.from(buffer));
    }

    @Post('create')
    @HttpCode(200)
    async create(@Body() body: any, @Req() req: any, @Res() res: Response) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decodeFromReq<CreateBreakoutRoomsReq>(req, body, CreateBreakoutRoomsReqSchema);

        if (!parsed?.rooms || !Array.isArray(parsed.rooms)) {
            throw new BadRequestException('rooms is required');
        }

        const clean = {
            duration: parsed?.duration,
            welcomeMsg: (parsed as any)?.welcomeMsg ?? (parsed as any)?.welcome_msg,
            rooms: parsed.rooms,
        } as CreateBreakoutRoomsReq;

        const result = await firstValueFrom(this.natsClient.send({ cmd: 'breakout.create' }, {
            ...clean,
            roomId,
            requestedUserId: userId,
        }));
        return this.sendProto(res, result);
    }

    @Post('join')
    @HttpCode(200)
    async join(@Body(new ProtobufParserPipe(JoinBreakoutRoomReqSchema)) body: JoinBreakoutRoomReq, @Req() req: any, @Res() res: Response) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };
        if (!userId) return { status: false, msg: 'userId required' };

        const result = await firstValueFrom(this.natsClient.send({ cmd: 'breakout.join' }, {
            ...body,
            roomId,
            userId,
            isAdmin,
        }));
        return this.sendProto(res, result);
    }

    @Get('listRooms')
    async listRooms(@Req() req: any, @Res() res: Response) {
        const { roomId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };
        const result = await firstValueFrom(this.natsClient.send({ cmd: 'breakout.list' }, { roomId }));
        return this.sendProto(res, result);
    }

    @Get('myRooms')
    async myRooms(@Req() req: any, @Res() res: Response) {
        const { roomId, userId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };
        if (!userId) return { status: false, msg: 'userId required' };
        const result = await firstValueFrom(this.natsClient.send({ cmd: 'breakout.myRooms' }, { roomId, userId }));
        return this.sendProto(res, result);
    }

    @Post('increaseDuration')
    @HttpCode(200)
    async increaseDuration(@Body(new ProtobufParserPipe(IncreaseBreakoutRoomDurationReqSchema)) body: IncreaseBreakoutRoomDurationReq, @Req() req: any, @Res() res: Response) {
        const { roomId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };

        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'breakout.increaseDuration' }, { ...body, roomId }),
        );
        return this.sendProto(res, result);
    }

    @Post('sendMsg')
    @HttpCode(200)
    async sendMsg(@Body(new ProtobufParserPipe(BroadcastBreakoutRoomMsgReqSchema)) body: BroadcastBreakoutRoomMsgReq, @Req() req: any, @Res() res: Response) {
        const { roomId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };

        const result = await firstValueFrom(this.natsClient.send({ cmd: 'breakout.sendMsg' }, { ...body, roomId }));
        return this.sendProto(res, result);
    }

    @Post('endRoom')
    @HttpCode(200)
    async endRoom(@Body(new ProtobufParserPipe(EndBreakoutRoomReqSchema)) body: EndBreakoutRoomReq, @Req() req: any, @Res() res: Response) {
        const { roomId } = this.getAuthContext(req);
        if (!roomId) return { status: false, msg: 'roomId required' };

        const result = await firstValueFrom(this.natsClient.send({ cmd: 'breakout.endRoom' }, { ...body, roomId }));
        return this.sendProto(res, result);
    }

    @Post('endAllRooms')
    @HttpCode(200)
    async endAllRooms(@Req() req: any, @Res() res: Response) {
        const { roomId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'breakout.endAllRooms' }, { roomId }),
        );
        return this.sendProto(res, result);
    }
}
