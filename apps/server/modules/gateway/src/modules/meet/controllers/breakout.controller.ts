import {
    Controller,
    Post,
    Get,
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
    IncreaseBreakoutRoomDurationReqSchema,
    BroadcastBreakoutRoomMsgReqSchema,
    BreakoutRoomResSchema,
} from '@workspace/protocol';
import {
    sendProtobufResponse,
    sendCommonProtobufResponse,
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
            sendCommonProtobufResponse(res, false, 'only admin can perform this task');
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

            // Explicitly create response
            const response = create(BreakoutRoomResSchema, {
                status: result.status,
                msg: result.msg,
            });

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        } catch (error) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message || 'Unknown Error',
            });
            res.status(HttpStatus.OK); // Return OK status even on logic error, as handled by status=false
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
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

            const response = create(BreakoutRoomResSchema, {
                status: result.status,
                msg: result.msg,
                token: result.token,
            });

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        } catch (error) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message || 'Unknown Error',
            });
            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        }
    }

    @Get('listRooms')
    @UseGuards(JwtAuthGuard)
    async getBreakoutRooms(@Req() req: Request, @Res() res: Response) {
        const roomId = (req as any).roomId as string;

        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.get' }, { roomId })
            );

            const response = create(BreakoutRoomResSchema, {
                status: result.status,
                msg: result.msg,
                rooms: result.rooms,
            });

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        } catch (error) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message || 'Unknown Error',
            });
            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        }
    }

    @Get('myRooms')
    @UseGuards(JwtAuthGuard)
    async getMyBreakoutRoom(@Req() req: Request, @Res() res: Response) {
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.my' }, { roomId, userId: requestedUserId })
            );

            const response = create(BreakoutRoomResSchema, {
                status: result.status,
                msg: result.msg,
                room: result.room,
            });

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        } catch (error) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message || 'Unknown Error',
            });
            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        }
    }

    @Post('increaseDuration')
    @UseGuards(JwtAuthGuard)
    async increaseDuration(
        @Req() req: Request,
        @Body() body: any,
        @Res() res: Response
    ) {
        const roomId = (req as any).roomId as string;

        try {
            let request: any;
            if (Buffer.isBuffer(body)) {
                request = fromBinary(IncreaseBreakoutRoomDurationReqSchema, body);
            } else {
                request = create(IncreaseBreakoutRoomDurationReqSchema, body);
            }
            request.roomId = roomId;

            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.increaseDuration' }, request)
            );

            const response = create(BreakoutRoomResSchema, {
                status: result.status,
                msg: result.msg,
            });

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        } catch (error) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message || 'Unknown Error',
            });
            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        }
    }

    @Post('sendMsg')
    @UseGuards(JwtAuthGuard)
    async sendMsg(
        @Req() req: Request,
        @Body() body: any,
        @Res() res: Response
    ) {
        const roomId = (req as any).roomId as string;

        try {
            let request: any;
            if (Buffer.isBuffer(body)) {
                request = fromBinary(BroadcastBreakoutRoomMsgReqSchema, body);
            } else {
                request = create(BroadcastBreakoutRoomMsgReqSchema, body);
            }
            request.roomId = roomId;

            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.broadcast' }, request)
            );

            const response = create(BreakoutRoomResSchema, {
                status: result.status,
                msg: result.msg,
            });

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        } catch (error) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message || 'Unknown Error',
            });
            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
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

            const response = create(BreakoutRoomResSchema, {
                status: result.status,
                msg: result.msg,
            });

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        } catch (error) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message || 'Unknown Error',
            });
            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        }
    }

    @Post('endAllRooms')
    @UseGuards(JwtAuthGuard)
    async endAllBreakoutRooms(@Req() req: Request, @Res() res: Response) {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;

        if (!isAdmin) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: 'only admin can perform this task'
            });
            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
            return;
        }

        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'breakout.endAll' }, { roomId })
            );

            const response = create(BreakoutRoomResSchema, {
                status: result.status,
                msg: result.msg,
            });

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        } catch (error) {
            const response = create(BreakoutRoomResSchema, {
                status: false,
                msg: error.message || 'Unknown Error',
            });
            res.status(HttpStatus.OK);
            sendProtobufResponse(res, BreakoutRoomResSchema, response);
        }
    }
}

