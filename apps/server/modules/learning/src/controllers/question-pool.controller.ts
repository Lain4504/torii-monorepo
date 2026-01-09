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
    questionPoolCreateDTOSchema,
    questionPoolUpdateDTOSchema,
    questionPoolQueryDTOSchema,
} from '@workspace/schemas';
import type {
    QuestionPoolCreateDTO,
    QuestionPoolUpdateDTO,
    QuestionPoolQueryDTO,
    QuestionPoolResponseDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { IQuestionPoolService } from '../interfaces/services/i-question-pool.service';
import { QUESTION_POOL_SERVICE_TOKEN } from '../interfaces/services/i-question-pool.service';

/**
 * Question Pool HTTP Controller
 * Handles question pool management operations
 */
@Controller('question-pools')
@UseGuards(GatewayAuthGuard)
export class QuestionPoolController {
    constructor(
        @Inject(QUESTION_POOL_SERVICE_TOKEN)
        private readonly questionPoolService: IQuestionPoolService,
    ) { }

    /**
     * Get all pools with pagination and filters
     */
    @Get()
    async findAll(
        @Query() query: QuestionPoolQueryDTO,
    ): Promise<PaginatedResponseDTO<QuestionPoolResponseDTO>> {
        return this.questionPoolService.findAll(query);
    }

    /**
     * Get pool by ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<QuestionPoolResponseDTO> {
        return this.questionPoolService.findOne(id);
    }

    /**
     * Get pools by course
     */
    @Get('course/:courseId')
    async getByCourse(@Param('courseId') courseId: string): Promise<QuestionPoolResponseDTO[]> {
        return this.questionPoolService.getByCourse(courseId);
    }

    /**
     * Get pools by lesson
     */
    @Get('lesson/:lessonId')
    async getByLesson(@Param('lessonId') lessonId: string): Promise<QuestionPoolResponseDTO[]> {
        return this.questionPoolService.getByLesson(lessonId);
    }

    /**
     * Get pools by JLPT level
     */
    @Get('jlpt-level/:jlptLevel')
    async getByJlptLevel(@Param('jlptLevel') jlptLevel: string): Promise<QuestionPoolResponseDTO[]> {
        return this.questionPoolService.getByJlptLevel(jlptLevel);
    }

    /**
     * Create new pool
     */
    @Post()
    @UsePipes(new ZodValidationPipe(questionPoolCreateDTOSchema))
    async create(
        @Request() req: ReqWithRequester,
        @Body() dto: QuestionPoolCreateDTO,
    ): Promise<QuestionPoolResponseDTO> {
        return this.questionPoolService.create(req.requester, dto);
    }

    /**
     * Update pool
     */
    @Patch(':id')
    @UsePipes(new ZodValidationPipe(questionPoolUpdateDTOSchema))
    async update(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: QuestionPoolUpdateDTO,
    ): Promise<QuestionPoolResponseDTO> {
        return this.questionPoolService.update(req.requester, id, dto);
    }

    /**
     * Delete pool
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<{ message: string }> {
        return this.questionPoolService.delete(req.requester, id);
    }
}

