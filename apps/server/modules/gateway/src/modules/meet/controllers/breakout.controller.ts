import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    HttpStatus,
    Inject,
    Logger,
    Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { create, fromBinary } from '@bufbuild/protobuf';
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

@Controller('api/breakoutRoom')
export class BreakoutController {
    private readonly logger = new Logger(BreakoutController.name);

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createBreakoutRooms(
        @Req() req: Request,
        @Body() body: any,
        @Res() res: Response
    ) {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        if (!isAdmin) {
            sendCommonProtoJsonResponse(res, false, 'only admin can perform this task');
            return;
        }

        try {
            let request: any;
            if (Buffer.isBuffer(body)) {
                request = fromBinary(CreateBreakoutRoomsReqSchema, body);
            } else {
                request = create(CreateBreakoutRoomsReqSchema, body);
            }
            request.roomId = roomId;
            request.requestedUserId = requestedUserId;

            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.create' }, request)
            );
            const response = create(CommonResponseSchema, result);
            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, CommonResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }

    @Post('join')
    @UseGuards(JwtAuthGuard)
    async joinBreakoutRoom(
        @Req() req: Request,
        @Body() body: any,
        @Res() res: Response
    ) {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;

        try {
            let request: any;
            if (Buffer.isBuffer(body)) {
                request = fromBinary(JoinBreakoutRoomReqSchema, body);
            } else {
                request = create(JoinBreakoutRoomReqSchema, body);
            }
            request.roomId = roomId;
            request.isAdmin = isAdmin;

            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.join' }, request)
            );
            // Result is token or object
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: error.message });
        }
    }

    @Post('endRoom')
    @UseGuards(JwtAuthGuard)
    async endBreakoutRoom(
        @Req() req: Request,
        @Body() body: any,
        @Res() res: Response
    ) {
        const roomId = (req as any).roomId as string;

        try {
            let request: any;
            if (Buffer.isBuffer(body)) {
                request = fromBinary(EndBreakoutRoomReqSchema, body);
            } else {
                request = create(EndBreakoutRoomReqSchema, body);
            }
            request.roomId = roomId;

            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.end' }, request)
            );
            const response = create(CommonResponseSchema, result);
            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, CommonResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }

    @Post('endAllRooms')
    @UseGuards(JwtAuthGuard)
    async endAllBreakoutRooms(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;

        if (!isAdmin) {
            sendCommonProtoJsonResponse(res, false, 'only admin can perform this task');
            return;
        }

        try {
            // Send roomId as object for robust handling in controller
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.endAll' }, { roomId })
            );
            const response = create(CommonResponseSchema, result);
            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, CommonResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }
}
