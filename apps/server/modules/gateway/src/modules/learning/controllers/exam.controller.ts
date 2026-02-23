import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    successPaginatedResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/exams')
@UseGuards(GatewayAuthGuard)
export class ExamController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.findAllWithStatus' },
                    { query, requester: req.requester }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exams');
        }
    }

    @Get('attempts')
    async getExamAttempts(@Query() query: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.getUserSessions' },
                    { query, requester: req.requester }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exam attempts');
        }
    }

    @Put('sessions/:sessionId/answers')
    async saveAnswers(
        @Param('sessionId') sessionId: string,
        @Body() data: any,
        @Req() req: ReqWithRequester
    ) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.saveAnswers' },
                    { sessionId, requester: req.requester, dto: data }
                )
            );
            return successResponse({ session: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to save answers');
        }
    }

    @Post('sessions/:sessionId/submit')
    async submitSession(@Param('sessionId') sessionId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.submitSession' },
                    { sessionId, requester: req.requester }
                )
            );
            return successResponse({ session: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to submit session');
        }
    }

    @Post(':id/start')
    async startExam(@Param('id') examId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.startExam' },
                    { examId, requester: req.requester }
                )
            );
            return successResponse({ session: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to start exam');
        }
    }

    @Get('sessions/:sessionId/details')
    async getAttemptDetails(@Param('sessionId') sessionId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.getAttemptDetails' },
                    { sessionId, requester: req.requester }
                )
            );
            return successResponse({ session: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch attempt details');
        }
    }

    @Get(':id/sessions')
    async getExamSessions(@Param('id') examId: string, @Query() query: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.getExamSessions' },
                    { examId, requester: req.requester, query }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exam sessions');
        }
    }

    @Get(':id')
    async getExamById(@Param('id') examId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.getExamById' },
                    { examId, requester: req.requester }
                )
            );
            return successResponse({ exam: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exam');
        }
    }
}
