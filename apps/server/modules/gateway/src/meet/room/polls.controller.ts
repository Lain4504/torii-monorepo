/**
 * Polls Controller
 *
 * Handles HTTP requests for poll operations
 * Routes under /api/polls (with JwtAuthGuard)
 */

import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { create, fromBinary } from '@bufbuild/protobuf';
import {
    ActivatePollsReq,
    ActivatePollsReqSchema,
    CreatePollReq,
    CreatePollReqSchema,
    SubmitPollResponseReq,
    SubmitPollResponseReqSchema,
    ClosePollReq,
    ClosePollReqSchema,
    PollResponse,
    PollResponseSchema,
} from '@workspace/protocol';
import {
    sendProtobufResponse,
    JwtAuthGuard,
} from '@server/shared';

@Controller('api/polls')
@UseGuards(JwtAuthGuard)
export class PollsController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('activate')
    @HttpCode(HttpStatus.OK)
    async handleActivatePolls(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;

        if (!isAdmin) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: 'only admin can perform this task',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        if (!roomId) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: 'roomId required',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        let request: ActivatePollsReq;
        try {
            request = fromBinary(ActivatePollsReqSchema, bodyBuffer);
            (request as any).roomId = roomId;
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Invalid request',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.activate' }, request)
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error activating polls',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Post('create')
    @HttpCode(HttpStatus.OK)
    async handleCreatePoll(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        if (!isAdmin) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: 'only admin can perform this task',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        let request: CreatePollReq;
        try {
            request = fromBinary(CreatePollReqSchema, bodyBuffer);
            (request as any).roomId = roomId;
            (request as any).userId = requestedUserId;
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Invalid request',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.create' }, request)
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                pollId: result.pollId,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error creating poll',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Get('listPolls')
    @HttpCode(HttpStatus.OK)
    async handleListPolls(
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const roomId = (req as any).roomId as string;

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.listPolls' }, { roomId })
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                polls: result.polls,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error listing polls',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Get('countTotalResponses/:pollId')
    @HttpCode(HttpStatus.OK)
    async handleCountPollTotalResponses(
        @Req() req: Request,
        @Param('pollId') pollId: string,
        @Res() res: Response,
    ): Promise<void> {
        const roomId = (req as any).roomId as string;

        if (!pollId) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: 'poll Id required',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.countTotalResponses' }, { roomId, pollId })
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                pollId: result.pollId,
                totalResponses: result.totalResponses,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error getting total responses',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Get('userSelectedOption/:pollId/:userId')
    @HttpCode(HttpStatus.OK)
    async handleUserSelectedOption(
        @Req() req: Request,
        @Param('pollId') pollId: string,
        @Param('userId') userId: string,
        @Res() res: Response,
    ): Promise<void> {
        const roomId = (req as any).roomId as string;

        if (!pollId || !userId) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: 'both userId & pollId required',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.userSelectedOption' }, { roomId, pollId, userId })
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                pollId: result.pollId,
                voted: result.voted,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error getting user selection',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Post('submitResponse')
    @HttpCode(HttpStatus.OK)
    async handleUserSubmitResponse(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        const roomId = (req as any).roomId as string;

        let request: SubmitPollResponseReq;
        try {
            request = fromBinary(SubmitPollResponseReqSchema, bodyBuffer);
            (request as any).roomId = roomId;
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Invalid request',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.submitResponse' }, request)
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                pollId: result.pollId,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error submitting response',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Post('closePoll')
    @HttpCode(HttpStatus.OK)
    async handleClosePoll(
        @Req() req: Request,
        @Body() bodyBuffer: Buffer,
        @Res() res: Response,
    ): Promise<void> {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        if (!isAdmin) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: 'only admin can perform this task',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        let request: ClosePollReq;
        try {
            request = fromBinary(ClosePollReqSchema, bodyBuffer);
            (request as any).roomId = roomId;
            (request as any).userId = requestedUserId;
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Invalid request',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.closePoll' }, request)
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                pollId: result.pollId,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error closing poll',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Get('pollResponsesDetails/:pollId')
    @HttpCode(HttpStatus.OK)
    async handleGetPollResponsesDetails(
        @Req() req: Request,
        @Param('pollId') pollId: string,
        @Res() res: Response,
    ): Promise<void> {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;

        if (!isAdmin) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: 'only admin can perform this task',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        if (!pollId) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: 'pollId required',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
            return;
        }

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.pollResponsesDetails' }, { roomId, pollId })
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                pollId: result.pollId,
                responses: result.responses,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error getting poll details',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Get('pollResponsesResult/:pollId')
    @HttpCode(HttpStatus.OK)
    async handleGetResponsesResult(
        @Req() req: Request,
        @Param('pollId') pollId: string,
        @Res() res: Response,
    ): Promise<void> {
        const roomId = (req as any).roomId as string;

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.pollResponsesResult' }, { roomId, pollId })
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                pollId: result.pollId,
                pollResponsesResult: result.pollResponsesResult,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error getting poll results',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }

    @Get('pollsStats')
    @HttpCode(HttpStatus.OK)
    async handleGetPollsStats(
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const roomId = (req as any).roomId as string;

        try {
            const result = await this.natsClient
                .send({ cmd: 'polls.pollsStats' }, { roomId })
                .toPromise();

            const response = create(PollResponseSchema, {
                status: result.status,
                msg: result.msg,
                stats: result.stats,
            });

            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        } catch (error) {
            const response = create(PollResponseSchema, {
                status: false,
                msg: error instanceof Error ? error.message : 'Error getting polls stats',
            });
            res.status(200);
            sendProtobufResponse(res, PollResponseSchema, response);
        }
    }
}



