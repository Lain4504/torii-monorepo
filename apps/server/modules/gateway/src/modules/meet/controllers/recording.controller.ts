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
    RecordingReqSchema,
    CommonResponseSchema,
} from '@workspace/protocol';
import {
    sendProtoJsonResponse,
    sendCommonProtoJsonResponse,
    JwtAuthGuard,
} from '@server/shared';

@Controller('recording')
export class RecordingController {
    private readonly logger = new Logger(RecordingController.name);

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async handleRecordingTask(@Body() body: any, @Res() res: Response) {
        try {
            const req = create(RecordingReqSchema, body);
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'recording' }, req)
            );
            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, CommonResponseSchema, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }

    @Post('fetch')
    @UseGuards(JwtAuthGuard)
    async fetchActiveRecordings(@Body() body: any, @Res() res: Response) {
        try {
            // No strict schema for request, maybe empty or specific filter
            // Sending 'recording.fetch' command to server
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'recording.fetch' }, body || {})
            );
            return res.status(HttpStatus.OK).json({ status: true, result });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: error.message });
        }
    }
}
