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
    CreateBreakoutRoomsReqSchema,
    JoinBreakoutRoomReqSchema,
    EndBreakoutRoomReqSchema,
    CommonResponseSchema,
} from '@workspace/protocol';
import {
    sendProtoJsonResponse,
    sendCommonProtoJsonResponse,
    JwtAuthGuard,
} from '@server/shared';

@Controller('breakout-room')
export class BreakoutController {
    private readonly logger = new Logger(BreakoutController.name);

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createBreakoutRooms(@Body() body: any, @Res() res: Response) {
        try {
            const req = create(CreateBreakoutRoomsReqSchema, body);
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.create' }, req)
            );
            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, CommonResponseSchema, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }

    @Post('join')
    @UseGuards(JwtAuthGuard)
    async joinBreakoutRoom(@Body() body: any, @Res() res: Response) {
        try {
            const req = create(JoinBreakoutRoomReqSchema, body);
            // Result for join might be JoinBreakoutRoomRes or simple CommonResponse
            // Assuming CommonResponse or custom response with token
            // Usually returns a token. 
            // In Go: `BreakoutRoomJoinRes`?
            // Let's assume generic response for now and improve if specific schema needed.
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.join' }, req)
            );
            // If result is generic object, just return it as json
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: error.message });
        }
    }

    @Post('end')
    @UseGuards(JwtAuthGuard)
    async endBreakoutRooms(@Body() body: any, @Res() res: Response) {
        try {
            const req = create(EndBreakoutRoomReqSchema, body);
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.end' }, req)
            );
            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, CommonResponseSchema, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }
}
