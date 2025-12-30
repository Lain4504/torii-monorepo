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
import { create } from '@bufbuild/protobuf';
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
    sendCommonProtoJsonResponse,
    sendProtoJsonResponse,
    parseAndValidateRequest,
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
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;

        if (!isAdmin) {
            sendCommonProtoJsonResponse(res, false, 'only admin can perform this task');
            return;
        }

        if (!roomId) {
            sendCommonProtoJsonResponse(res, false, 'roomId required');
            return;
        }

        let request: ActivatePollsReq;
        try {
            request = parseAndValidateRequest<ActivatePollsReq>(body, ActivatePollsReqSchema);
            (request as any).roomId = roomId;
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error activating polls');
        }
    }

    @Post('create')
    @HttpCode(HttpStatus.OK)
    async handleCreatePoll(
        @Req() req: Request,
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        if (!isAdmin) {
            sendCommonProtoJsonResponse(res, false, 'Only admin can perform this task');
            return;
        }

        let request: CreatePollReq;
        try {
            request = parseAndValidateRequest<CreatePollReq>(body, CreatePollReqSchema);
            (request as any).roomId = roomId;
            (request as any).userId = requestedUserId;
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error creating poll');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error listing polls');
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
            sendCommonProtoJsonResponse(res, false, 'pollId required');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting total responses');
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
            sendCommonProtoJsonResponse(res, false, 'both userId & pollId required');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting user selection');
        }
    }

    @Post('submitResponse')
    @HttpCode(HttpStatus.OK)
    async handleUserSubmitResponse(
        @Req() req: Request,
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        const roomId = (req as any).roomId as string;

        let request: SubmitPollResponseReq;
        try {
            request = parseAndValidateRequest<SubmitPollResponseReq>(body, SubmitPollResponseReqSchema);
            (request as any).roomId = roomId;
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error submitting response');
        }
    }

    @Post('closePoll')
    @HttpCode(HttpStatus.OK)
    async handleClosePoll(
        @Req() req: Request,
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        const isAdmin = (req as any).isAdmin as boolean;
        const roomId = (req as any).roomId as string;
        const requestedUserId = (req as any).requestedUserId as string;

        if (!isAdmin) {
            sendCommonProtoJsonResponse(res, false, 'only admin can perform this task');
            return;
        }

        let request: ClosePollReq;
        try {
            request = parseAndValidateRequest<ClosePollReq>(body, ClosePollReqSchema);
            (request as any).roomId = roomId;
            (request as any).userId = requestedUserId;
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error closing poll');
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
            sendCommonProtoJsonResponse(res, false, 'only admin can perform this task');
            return;
        }

        if (!pollId) {
            sendCommonProtoJsonResponse(res, false, 'pollId required');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting poll details');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting poll results');
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
            sendProtoJsonResponse(res, PollResponseSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting polls stats');
        }
    }
}
