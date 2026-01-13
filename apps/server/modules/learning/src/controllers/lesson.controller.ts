import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UsePipes,
    UseGuards,
    Request,
    Inject,
} from '@nestjs/common';
import { ZodValidationPipe, GatewayAuthGuard } from '@server/shared';
import { lessonCreateDTOSchema, lessonUpdateDTOSchema } from '@workspace/schemas';
import type {
    LessonResponseDTO,
    LessonCreateDTO,
    LessonUpdateDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { ILessonService } from '../interfaces/services';
import { LESSON_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Lesson HTTP Controller
 * Handles lesson management operations
 */
@Controller('lessons')
@UseGuards(GatewayAuthGuard)
export class LessonController {
    constructor(@Inject(LESSON_SERVICE_TOKEN) private readonly lessonService: ILessonService) { }

    /**
     * Get all lessons with pagination
     */
    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ): Promise<PaginatedResponseDTO<LessonResponseDTO>> {
        return this.lessonService.findAll({
            page: Number(page),
            limit: Number(limit),
            search,
        });
    }

    /**
     * Get all lessons for a module
     */
    @Get('by-module/:moduleId')
    async findByModuleId(
        @Request() req: ReqWithRequester,
        @Param('moduleId') moduleId: string
    ): Promise<LessonResponseDTO[]> {
        return this.lessonService.findByModuleId(moduleId, req.requester);
    }

    /**
     * Get preview lessons for a course
     */
    @Get('preview/by-course/:courseId')
    async findPreviewLessonsByCourseId(@Param('courseId') courseId: string): Promise<LessonResponseDTO[]> {
        return this.lessonService.findPreviewLessonsByCourseId(courseId);
    }

    /**
     * Get lesson by ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<LessonResponseDTO> {
        return this.lessonService.findOne(id);
    }

    /**
     * Create new lesson
     */
    @Post()
    @UsePipes(new ZodValidationPipe(lessonCreateDTOSchema))
    async create(
        @Request() req: ReqWithRequester,
        @Body() dto: LessonCreateDTO
    ): Promise<LessonResponseDTO> {
        return this.lessonService.create(req.requester, dto);
    }

    /**
     * Reorder lessons in a module
     */
    @Post('reorder/:moduleId')
    async reorder(
        @Request() req: ReqWithRequester,
        @Param('moduleId') moduleId: string,
        @Body() lessonOrders: { id: string; orderIndex: number }[],
    ): Promise<{ message: string }> {
        return this.lessonService.reorder(req.requester, moduleId, lessonOrders);
    }

    /**
     * Update lesson
     */
    @Patch(':id')
    @UsePipes(new ZodValidationPipe(lessonUpdateDTOSchema))
    async update(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: LessonUpdateDTO,
    ): Promise<LessonResponseDTO> {
        return this.lessonService.update(req.requester, id, dto);
    }

    /**
     * Delete lesson
     */
    @Delete(':id')
    async delete(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string,
    ): Promise<{ message: string }> {
        const isHardDelete = hardDelete === 'true';
        return this.lessonService.delete(req.requester, id, isHardDelete);
    }
}
