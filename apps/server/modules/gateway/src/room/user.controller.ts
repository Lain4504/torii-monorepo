import {
    Body,
    Controller,
    Inject,
    Post,
    HttpCode,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type {
    UpdateUserLockSettingsReq,
    MuteUnMuteTrackReq,
    RemoveParticipantReq,
    SwitchPresenterReq,
} from '@workspace/protocol';
import { UpdateUserLockSettingsReqSchema, MuteUnMuteTrackReqSchema, RemoveParticipantReqSchema, SwitchPresenterReqSchema } from '@workspace/protocol';
import { fromBinary } from '@bufbuild/protobuf';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class UserController {
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
        return (body as T) || ({} as T);
    }

    private getAuthContext(req: any) {
        const user = req.user || {};
        const roomId = user.room_id || user.room || user.video?.room;
        const userId = user.user_id || user.userId || user.sub;
        const isAdmin = user.is_admin ?? user.isAdmin ?? user.metadata?.is_admin ?? user.metadata?.isAdmin ?? false;
        return { roomId, userId, isAdmin };
    }

    @Post('updateLockSettings')
    @HttpCode(200)
    async updateLockSettings(@Body() body: UpdateUserLockSettingsReq, @Req() req: any) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<UpdateUserLockSettingsReq>(req, body, UpdateUserLockSettingsReqSchema);
        if (parsed.roomId && parsed.roomId !== roomId) return { status: false, msg: 'requested roomId & token roomId mismatched' };

        return firstValueFrom(
            this.natsClient.send({ cmd: 'user.updateLockSettings' }, {
                ...parsed,
                roomId,
                requestedUserId: userId,
            }),
        );
    }

    @Post('muteUnmuteTrack')
    @HttpCode(200)
    async muteUnmuteTrack(@Body() body: MuteUnMuteTrackReq, @Req() req: any) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<MuteUnMuteTrackReq>(req, body, MuteUnMuteTrackReqSchema);
        if (parsed?.roomId && parsed.roomId !== roomId) return { status: false, msg: 'requested roomId & token roomId mismatched' };
        if (!parsed?.userId) return { status: false, msg: 'userId required' };

        return firstValueFrom(
            this.natsClient.send({ cmd: 'user.muteUnmuteTrack' }, {
                ...parsed,
                roomId,
                requestedUserId: userId,
            }),
        );
    }

    @Post('removeParticipant')
    @HttpCode(200)
    async removeParticipant(@Body() body: RemoveParticipantReq, @Req() req: any) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<RemoveParticipantReq>(req, body, RemoveParticipantReqSchema);
        if (parsed.roomId && parsed.roomId !== roomId) return { status: false, msg: 'requested roomId & token roomId mismatched' };
        if (parsed.userId && parsed.userId === userId) return { status: false, msg: `you can't remove yourself` };

        return firstValueFrom(
            this.natsClient.send({ cmd: 'user.removeParticipant' }, {
                ...parsed,
                roomId,
                requestedUserId: userId,
            }),
        );
    }

    @Post('switchPresenter')
    @HttpCode(200)
    async switchPresenter(@Body() body: SwitchPresenterReq, @Req() req: any) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<SwitchPresenterReq>(req, body, SwitchPresenterReqSchema);

        return firstValueFrom(
            this.natsClient.send({ cmd: 'user.switchPresenter' }, {
                ...parsed,
                roomId,
                requestedUserId: userId,
            }),
        );
    }
}
