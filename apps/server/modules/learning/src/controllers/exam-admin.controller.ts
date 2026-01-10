import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    Logger,
    UsePipes,
    Inject,
} from '@nestjs/common';
import {
    type ExamCreateDTO,
    type ExamUpdateDTO,
    type ExamQueryDTO,
    type ExamResponseDTO,
    type PaginatedResponseDTO,
    examCreateDTOSchema,
    examUpdateDTOSchema,
    examQueryDTOSchema,
    type ExamSessionQueryDTO,
    type ExamSessionWithExamResponseDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard, ZodValidationPipe } from '@server/shared';
import type { ReqWithRequester } from '@workspace/schemas';
import type { IExamService } from '../interfaces/services/i-exam.service';
import { EXAM_SERVICE_TOKEN } from '../interfaces/services/i-exam.service';

/**
 * Exam Admin Controller
 * Handles exam/quiz management operations for staff and admins
 */
@Controller('admin/exams')
@UseGuards(GatewayAuthGuard)
export class ExamAdminController {
    private readonly logger = new Logger(ExamAdminController.name);

    constructor(
        @Inject(EXAM_SERVICE_TOKEN)
        private readonly examService: IExamService,
    ) { }

    /**
     * Get all exams with filters (Staff view)
     * GET /api/admin/exams
     */
    @Get()
    async findAll(
        @Query(new ZodValidationPipe(examQueryDTOSchema)) query: ExamQueryDTO,
    ): Promise<PaginatedResponseDTO<ExamResponseDTO>> {
        this.logger.log(`GET /admin/exams called with query: ${JSON.stringify(query)}`);
        return this.examService.findAll(query);
    }

    /**
     * Get exam by ID
     * GET /api/admin/exams/:id
     */
    @Get(':id')
    async findOne(@Param('id') examId: string): Promise<ExamResponseDTO> {
        this.logger.log(`GET /admin/exams/${examId} called`);
        return this.examService.findOne(examId);
    }

    /**
     * Create a new exam/quiz
     * POST /api/admin/exams
     */
    @Post()
    async create(
        @Body(new ZodValidationPipe(examCreateDTOSchema)) dto: ExamCreateDTO,
        @Req() req: ReqWithRequester,
    ): Promise<ExamResponseDTO> {
        this.logger.log(`POST /admin/exams called by ${req.requester?.sub}`);
        return this.examService.create(req.requester!, dto);
    }

    /**
     * Update an exam/quiz
     * PUT /api/admin/exams/:id
     */
    @Put(':id')
    async update(
        @Param('id') examId: string,
        @Body(new ZodValidationPipe(examUpdateDTOSchema)) dto: ExamUpdateDTO,
        @Req() req: ReqWithRequester,
    ): Promise<ExamResponseDTO> {
        this.logger.log(`PUT /admin/exams/${examId} called by ${req.requester?.sub}`);
        return this.examService.update(req.requester!, examId, dto);
    }

    /**
     * Delete an exam/quiz
     * DELETE /api/admin/exams/:id
     */
    @Delete(':id')
    async delete(
        @Param('id') examId: string,
        @Req() req: ReqWithRequester,
    ): Promise<{ message: string }> {
        this.logger.log(`DELETE /admin/exams/${examId} called by ${req.requester?.sub}`);
        await this.examService.delete(req.requester!, examId);
        return { message: 'Exam deleted successfully' };
    }

    /**
     * Publish an exam/quiz
     * POST /api/admin/exams/:id/publish
     */
    @Post(':id/publish')
    async publish(
        @Param('id') examId: string,
        @Req() req: ReqWithRequester,
    ): Promise<ExamResponseDTO> {
        this.logger.log(`POST /admin/exams/${examId}/publish called by ${req.requester?.sub}`);
        return this.examService.publish(req.requester!, examId);
    }

    /**
     * Get quiz statistics
     * GET /api/admin/exams/:id/stats
     */
    @Get(':id/stats')
    async getStats(
        @Param('id') examId: string,
    ): Promise<any> {
        this.logger.log(`GET /admin/exams/${examId}/stats called`);
        return this.examService.getQuizStatistics(examId);
    }

    /**
     * Get all attempts for a quiz
     * GET /api/admin/exams/:id/attempts
     */
    @Get(':id/attempts')
    async getQuizAttempts(
        @Param('id') examId: string,
        @Query() query: ExamSessionQueryDTO,
    ): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>> {
        this.logger.log(`GET /admin/exams/${examId}/attempts called`);
        return this.examService.getQuizAttempts(examId, query);
    }
}

