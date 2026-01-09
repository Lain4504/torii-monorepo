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
import { courseCreateDTOSchema, courseUpdateDTOSchema } from '@workspace/schemas';
import type {
    CourseResponseDTO,
    CourseCreateDTO,
    CourseUpdateDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { ICourseService } from '../interfaces/services';
import { COURSE_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Course HTTP Controller
 * Handles course management operations
 */
@Controller('courses')
export class CourseController {
    constructor(@Inject(COURSE_SERVICE_TOKEN) private readonly courseService: ICourseService) { }

    /**
     * Get all courses with pagination
     */
    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search: string = '',
    ): Promise<PaginatedResponseDTO<CourseResponseDTO>> {
        return this.courseService.findAll({
            page: Number(page),
            limit: Number(limit),
            search,
        });
    }

    /**
     * Get featured courses
     */
    @Get('featured')
    async getFeatured(): Promise<CourseResponseDTO[]> {
        return this.courseService.getFeatured();
    }

    /**
     * Get courses by type (vod/live)
     */
    @Get('by-type/:type')
    async getByType(@Param('type') type: 'vod' | 'live'): Promise<CourseResponseDTO[]> {
        return this.courseService.getByType(type);
    }

    /**
     * Get course by slug
     */
    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string): Promise<CourseResponseDTO> {
        return this.courseService.findBySlug(slug);
    }

    /**
     * Get course curriculum (modules with lessons)
     */
    @Get(':id/curriculum')
    async getCurriculum(@Param('id') id: string) {
        return this.courseService.getCurriculum(id);
    }

    /**
     * Get course by ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<CourseResponseDTO> {
        return this.courseService.findOne(id);
    }

    /**
     * Create new course
     */
    @Post()
    @UseGuards(GatewayAuthGuard)
    async create(
        @Request() req: ReqWithRequester,
        @Body(new ZodValidationPipe(courseCreateDTOSchema)) dto: CourseCreateDTO
    ): Promise<CourseResponseDTO> {
        return this.courseService.create(req.requester, dto);
    }

    /**
     * Update course
     */
    @Patch(':id')
    @UseGuards(GatewayAuthGuard)
    async update(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body(new ZodValidationPipe(courseUpdateDTOSchema)) dto: CourseUpdateDTO,
    ): Promise<CourseResponseDTO> {
        return this.courseService.update(req.requester, id, dto);
    }

    /**
     * Publish course
     */
    @Post(':id/publish')
    @UseGuards(GatewayAuthGuard)
    async publish(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<CourseResponseDTO> {
        return this.courseService.publish(req.requester, id);
    }

    /**
     * Unpublish course
     */
    @Post(':id/unpublish')
    @UseGuards(GatewayAuthGuard)
    async unpublish(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
    ): Promise<CourseResponseDTO> {
        return this.courseService.unpublish(req.requester, id);
    }

    /**
     * Delete course
     */
    @Delete(':id')
    @UseGuards(GatewayAuthGuard)
    async delete(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Query('hardDelete') hardDelete?: string,
    ): Promise<{ message: string }> {
        const isHardDelete = hardDelete === 'true';
        return this.courseService.delete(req.requester, id, isHardDelete);
    }
}
