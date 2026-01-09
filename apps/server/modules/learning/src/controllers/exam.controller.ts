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
    Logger,
    Inject,
} from '@nestjs/common';
import {
    type ExamQueryDTO,
    type ExamSessionStartResponseDTO,
    type ExamSessionAnswersDTO,
    type ExamSessionResponseDTO,
    type ExamWithStatusResponseDTO,
    type ExamSessionQueryDTO,
    type ExamSessionWithExamResponseDTO,
    type PaginatedResponseDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';
import type { IExamService } from '../interfaces/services/i-exam.service';
import { EXAM_SERVICE_TOKEN } from '../interfaces/services/i-exam.service';

@Controller('exams')
@UseGuards(GatewayAuthGuard)
export class ExamController {
    private readonly logger = new Logger(ExamController.name);

    constructor(
        @Inject(EXAM_SERVICE_TOKEN)
        private readonly examService: IExamService,
    ) { }

    @Get()
    async findAll(
        @Query() query: ExamQueryDTO,
        @Req() req: any,
    ): Promise<PaginatedResponseDTO<ExamWithStatusResponseDTO>> {
        this.logger.log(`GET /exams called with query: ${JSON.stringify(query)}`);
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        this.logger.log(`User ID: ${userId}`);
        const result = await this.examService.findAllWithStatus(query, userId);
        this.logger.log(`Returning ${result.data.length} exams`);
        return result;
    }

    /**
     * GET /api/exams/attempts
     * Get user's exam attempts (history)
     * MUST be before @Get(':id') to avoid route conflict
     */
    @Get('attempts')
    async getExamAttempts(
        @Query() query: ExamSessionQueryDTO,
        @Req() req: any,
    ): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>> {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            this.logger.error('User ID not found in request', { user: req.user });
            throw new Error('User ID not found in request');
        }
        this.logger.log(`GET /exams/attempts called with query: ${JSON.stringify(query)}`);
        return this.examService.getUserSessions(userId, query);
    }

    /**
     * PUT /api/exams/sessions/:sessionId/answers
     * Save exam session answers
     */
    @Put('sessions/:sessionId/answers')
    async saveAnswers(
        @Param('sessionId') sessionId: string,
        @Body() data: ExamSessionAnswersDTO,
        @Req() req: any,
    ): Promise<ExamSessionResponseDTO> {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            this.logger.error('User ID not found in request', { user: req.user });
            throw new Error('User ID not found in request');
        }
        return this.examService.saveAnswers(sessionId, userId, data);
    }

    /**
     * POST /api/exams/sessions/:sessionId/submit
     * Submit exam session
     */
    @Post('sessions/:sessionId/submit')
    async submitSession(
        @Param('sessionId') sessionId: string,
        @Req() req: any,
    ): Promise<ExamSessionResponseDTO> {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            this.logger.error('User ID not found in request', { user: req.user });
            throw new Error('User ID not found in request');
        }
        return this.examService.submitSession(sessionId, userId);
    }

    /**
     * POST /api/exams/:id/start
     * Start an exam session
     * MUST be before @Get(':id') to avoid route conflict
     */
    @Post(':id/start')
    async startExam(
        @Param('id') examId: string,
        @Req() req: any,
    ): Promise<ExamSessionStartResponseDTO> {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            this.logger.error('User ID not found in request', { user: req.user });
            throw new Error('User ID not found in request');
        }
        return this.examService.startExam(examId, userId);
    }

    /**
     * GET /api/exams/sessions/:sessionId/details
     * Get attempt details with explanations (if allowed)
     */
    @Get('sessions/:sessionId/details')
    async getAttemptDetails(
        @Param('sessionId') sessionId: string,
        @Req() req: any,
    ): Promise<any> {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId) {
            this.logger.error('User ID not found in request', { user: req.user });
            throw new Error('User ID not found in request');
        }
        return this.examService.getAttemptDetails(sessionId, userId);
    }
}

