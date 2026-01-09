import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UsePipes,
    Request,
    Inject,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ZodValidationPipe, GatewayAuthGuard } from '@server/shared';
import {
    questionCreateDTOSchema,
    questionUpdateDTOSchema,
    questionQueryDTOSchema,
} from '@workspace/schemas';
import type {
    QuestionCreateDTO,
    QuestionUpdateDTO,
    QuestionQueryDTO,
    QuestionResponseDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { IQuestionService } from '../interfaces/services/i-question.service';
import { QUESTION_SERVICE_TOKEN } from '../interfaces/services/i-question.service';

/**
 * Question HTTP Controller
 * Handles question management operations
 */
@Controller('questions')
@UseGuards(GatewayAuthGuard)
export class QuestionController {
    constructor(
        @Inject(QUESTION_SERVICE_TOKEN)
        private readonly questionService: IQuestionService,
    ) { }

    /**
     * Get all questions with pagination and filters
     */
    @Get()
    async findAll(
        @Query() query: QuestionQueryDTO,
    ): Promise<PaginatedResponseDTO<QuestionResponseDTO>> {
        return this.questionService.findAll(query);
    }

    /**
     * Get question by ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<QuestionResponseDTO> {
        return this.questionService.findOne(id);
    }

    /**
     * Get questions by category
     */
    @Get('category/:category')
    async getByCategory(@Param('category') category: string): Promise<QuestionResponseDTO[]> {
        return this.questionService.getByCategory(category);
    }

    /**
     * Get questions by JLPT level
     */
    @Get('jlpt-level/:jlptLevel')
    async getByJlptLevel(@Param('jlptLevel') jlptLevel: string): Promise<QuestionResponseDTO[]> {
        return this.questionService.getByJlptLevel(jlptLevel);
    }

    /**
     * Get questions by status
     */
    @Get('status/:status')
    async getByStatus(@Param('status') status: string): Promise<QuestionResponseDTO[]> {
        return this.questionService.getByStatus(status);
    }

    /**
     * Get questions by pool
     */
    @Get('pool/:poolId')
    async getByPool(@Param('poolId') poolId: string): Promise<QuestionResponseDTO[]> {
        return this.questionService.getByPool(poolId);
    }

    /**
     * Create new question
     */
    @Post()
    @UsePipes(new ZodValidationPipe(questionCreateDTOSchema))
    async create(
        @Request() req: ReqWithRequester,
        @Body() dto: QuestionCreateDTO,
    ): Promise<QuestionResponseDTO> {
        return this.questionService.create(req.requester, dto);
    }

    /**
     * Create multiple questions (bulk)
     */
    @Post('bulk')
    async createMany(
        @Request() req: ReqWithRequester,
        @Body() dtos: QuestionCreateDTO[],
    ): Promise<{ count: number; created: QuestionResponseDTO[] }> {
        return this.questionService.createMany(req.requester, dtos);
    }

    /**
     * Update question
     */
    @Patch(':id')
    @UsePipes(new ZodValidationPipe(questionUpdateDTOSchema))
    async update(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: QuestionUpdateDTO,
    ): Promise<QuestionResponseDTO> {
        return this.questionService.update(req.requester, id, dto);
    }

    /**
     * Update multiple questions (bulk)
     */
    @Patch('bulk/update')
    async updateMany(
        @Request() req: ReqWithRequester,
        @Body() body: { questionIds: string[]; data: QuestionUpdateDTO },
    ): Promise<{ count: number }> {
        return this.questionService.updateMany(req.requester, body.questionIds, body.data);
    }

    /**
     * Delete question
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<{ message: string }> {
        return this.questionService.delete(req.requester, id);
    }

    /**
     * Delete multiple questions (bulk)
     */
    @Delete('bulk/delete')
    @HttpCode(HttpStatus.OK)
    async deleteMany(
        @Request() req: ReqWithRequester,
        @Body() body: { questionIds: string[] },
    ): Promise<{ count: number }> {
        return this.questionService.deleteMany(req.requester, body.questionIds);
    }

    /**
     * Approve question (change status to active)
     */
    @Post(':id/approve')
    async approve(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<QuestionResponseDTO> {
        return this.questionService.approve(req.requester, id);
    }

    /**
     * Deactivate question (change status to inactive)
     */
    @Post(':id/deactivate')
    async deactivate(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<QuestionResponseDTO> {
        return this.questionService.deactivate(req.requester, id);
    }

    /**
     * Reject question (change status to archived)
     */
    @Post(':id/reject')
    async reject(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<QuestionResponseDTO> {
        return this.questionService.reject(req.requester, id);
    }

    /**
     * Send question for review (change status to review)
     */
    @Post(':id/review')
    async sendForReview(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<QuestionResponseDTO> {
        return this.questionService.sendForReview(req.requester, id);
    }
}

