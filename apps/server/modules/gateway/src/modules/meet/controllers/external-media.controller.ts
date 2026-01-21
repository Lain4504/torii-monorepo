import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    HttpStatus,
    Inject,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { create } from '@bufbuild/protobuf';
import {
    ExternalMediaPlayerReqSchema,
    ExternalDisplayLinkReqSchema,
    CommonResponseSchema,
} from '@workspace/protocol';
import {
    sendProtoJsonResponse,
    sendCommonProtoJsonResponse,
    JwtAuthGuard,
} from '@server/shared';

@Controller('external-media')
export class ExternalMediaController {
    private readonly logger = new Logger(ExternalMediaController.name);

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('player')
    @UseGuards(JwtAuthGuard)
    async updateMediaPlayer(@Body() body: any, @Res() res: Response) {
        try {
            const req = create(ExternalMediaPlayerReqSchema, body);
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'externalMedia.player' }, req)
            );
            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, CommonResponseSchema, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }

    @Post('display')
    @UseGuards(JwtAuthGuard)
    async updateDisplayLink(@Body() body: any, @Res() res: Response) {
        try {
            const req = create(ExternalDisplayLinkReqSchema, body);
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'externalMedia.display' }, req)
            );
            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, CommonResponseSchema, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }
}
