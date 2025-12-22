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
    ExternalMediaPlayerReq,
    ExternalDisplayLinkReq,
} from '@workspace/protocol';
import { ExternalMediaPlayerReqSchema, ExternalDisplayLinkReqSchema } from '@workspace/protocol';
import { fromBinary } from '@bufbuild/protobuf';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class ExternalMediaController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    private decode<T>(req: any, body: any, schema: any): T {
        const raw = req?.body;
        if (raw && Buffer.isBuffer(raw) && raw.length > 0) {
            try {
                return fromBinary(schema, raw) as T;
            } catch { /* fall back below */ }
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

    @Post('externalMediaPlayer')
    @HttpCode(200)
    async externalMediaPlayer(@Body() body: ExternalMediaPlayerReq, @Req() req: any) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<ExternalMediaPlayerReq>(req, body, ExternalMediaPlayerReqSchema);
        return firstValueFrom(
            this.natsClient.send({ cmd: 'exMedia.handle' }, {
                ...parsed,
                roomId,
                userId,
            }),
        );
    }

    @Post('externalDisplayLink')
    @HttpCode(200)
    async externalDisplayLink(@Body() body: ExternalDisplayLinkReq, @Req() req: any) {
        const { roomId, userId, isAdmin } = this.getAuthContext(req);
        if (!isAdmin) return { status: false, msg: 'only admin can perform this task' };
        if (!roomId) return { status: false, msg: 'roomId required' };

        const parsed = this.decode<ExternalDisplayLinkReq>(req, body, ExternalDisplayLinkReqSchema);
        return firstValueFrom(
            this.natsClient.send({ cmd: 'exDisplay.handle' }, {
                ...parsed,
                roomId,
                userId,
            }),
        );
    }
}
