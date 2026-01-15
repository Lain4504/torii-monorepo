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
    errorResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('exams')
@UseGuards(IdentityAuthGuard)
export class ExamController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.findAllWithStatus' },
                    { query, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exams');
        }
    }

    @Get('attempts')
    async getExamAttempts(@Query() query: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.getUserSessions' },
                    { query, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch exam attempts');
        }
    }

    @Put('sessions/:sessionId/answers')
    async saveAnswers(
        @Param('sessionId') sessionId: string,
        @Body() data: any,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.saveAnswers' },
                    { sessionId, userId: user.sub, dto: data }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to save answers');
        }
    }

    @Post('sessions/:sessionId/submit')
    async submitSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.submitSession' },
                    { sessionId, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to submit session');
        }
    }

    @Post(':id/start')
    async startExam(@Param('id') examId: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.startExam' },
                    { examId, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to start exam');
        }
    }

    @Get('sessions/:sessionId/details')
    async getAttemptDetails(@Param('sessionId') sessionId: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.exam.getAttemptDetails' },
                    { sessionId, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch attempt details');
        }
    }
}
