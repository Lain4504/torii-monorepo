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
    questionBankCreateDTOSchema,
    questionBankUpdateDTOSchema,
    questionBankQueryDTOSchema,
} from '@workspace/schemas';
import type {
    QuestionBankCreateDTO,
    QuestionBankUpdateDTO,
    QuestionBankQueryDTO,
    QuestionBankResponseDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { IQuestionBankService } from '../services/i-question-bank.service';
import { QUESTION_BANK_SERVICE_TOKEN } from '../services/i-question-bank.service';

/**
 * Question Bank HTTP Controller
 * Handles question bank management operations
 */
@Controller('question-banks')
@UseGuards(GatewayAuthGuard)
export class QuestionBankController {
    constructor(
        @Inject(QUESTION_BANK_SERVICE_TOKEN)
        private readonly questionBankService: IQuestionBankService,
    ) { }

    /**
     * Get all questions with pagination and filters
     */
    @Get()
    async findAll(
        @Query() query: QuestionBankQueryDTO,
    ): Promise<PaginatedResponseDTO<QuestionBankResponseDTO>> {
        return this.questionBankService.findAll(query);
    }

    /**
     * Get question by ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.findOne(id);
    }

    /**
     * Get questions by category
     */
    @Get('category/:category')
    async getByCategory(@Param('category') category: string): Promise<QuestionBankResponseDTO[]> {
        return this.questionBankService.getByCategory(category);
    }

    /**
     * Get questions by JLPT level
     */
    @Get('jlpt-level/:jlptLevel')
    async getByJlptLevel(@Param('jlptLevel') jlptLevel: string): Promise<QuestionBankResponseDTO[]> {
        return this.questionBankService.getByJlptLevel(jlptLevel);
    }

    /**
     * Get questions by status
     */
    @Get('status/:status')
    async getByStatus(@Param('status') status: string): Promise<QuestionBankResponseDTO[]> {
        return this.questionBankService.getByStatus(status);
    }

    /**
     * Create new question
     */
    @Post()
    @UsePipes(new ZodValidationPipe(questionBankCreateDTOSchema))
    async create(
        @Request() req: ReqWithRequester,
        @Body() dto: QuestionBankCreateDTO,
    ): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.create(req.requester, dto);
    }

    /**
     * Create multiple questions (bulk)
     */
    @Post('bulk')
    async createMany(
        @Request() req: ReqWithRequester,
        @Body() dtos: QuestionBankCreateDTO[],
    ): Promise<{ count: number; created: QuestionBankResponseDTO[] }> {
        return this.questionBankService.createMany(req.requester, dtos);
    }

    /**
     * Update question
     */
    @Patch(':id')
    @UsePipes(new ZodValidationPipe(questionBankUpdateDTOSchema))
    async update(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: QuestionBankUpdateDTO,
    ): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.update(req.requester, id, dto);
    }

    /**
     * Update multiple questions (bulk)
     */
    @Patch('bulk/update')
    async updateMany(
        @Request() req: ReqWithRequester,
        @Body() body: { questionIds: string[]; data: QuestionBankUpdateDTO },
    ): Promise<{ count: number }> {
        return this.questionBankService.updateMany(req.requester, body.questionIds, body.data);
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
        return this.questionBankService.delete(req.requester, id);
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
        return this.questionBankService.deleteMany(req.requester, body.questionIds);
    }

    /**
     * Approve question (change status to active)
     */
    @Post(':id/approve')
    async approve(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.approve(req.requester, id);
    }

    /**
     * Reject question (change status to archived)
     */
    @Post(':id/reject')
    async reject(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.reject(req.requester, id);
    }

    /**
     * Send question for review (change status to review)
     */
    @Post(':id/review')
    async sendForReview(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.sendForReview(req.requester, id);
    }
}
