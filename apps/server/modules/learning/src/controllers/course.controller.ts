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
    ParseUUIDPipe,
} from '@nestjs/common';
import { ZodValidationPipe, GatewayAuthGuard } from '@server/shared';
import { courseCreateDTOSchema, courseUpdateDTOSchema, courseQueryDTOSchema, CourseStatus } from '@workspace/schemas';
import type {
    CourseResponseDTO,
    CourseCreateDTO,
    CourseUpdateDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
    CourseQueryDTO,
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
     * Advanced search for client
     */
    @Get('advanced-search')
    async advancedSearch(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('q') search?: string,
        @Query('levels') levels?: string,
        @Query('priceMin') priceMin?: number,
        @Query('priceMax') priceMax?: number,
        @Query('sort') sortBy?: string,
    ): Promise<PaginatedResponseDTO<CourseResponseDTO>> {
        // Parse levels from comma separated string
        const parsedLevels = levels ? levels.split(',') : undefined;

        return this.courseService.advancedSearch({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 12,
            search,
            levels: parsedLevels,
            priceMin: priceMin ? Number(priceMin) : undefined,
            priceMax: priceMax ? Number(priceMax) : undefined,
            sortBy
        });
    }

    /**
     * Get all courses with pagination and filters
     */
    @Get()
    async findAll(
        @Query(new ZodValidationPipe(courseQueryDTOSchema)) query: CourseQueryDTO,
    ): Promise<PaginatedResponseDTO<CourseResponseDTO>> {
        return this.courseService.findAll({
            page: query.page,
            limit: query.limit,
            search: query.search,
            status: query.status,
            jlptLevel: query.jlptLevel,
        });
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
     * Check enrollment status for current user
     */
    @Get(':id/enrollment-status')
    @UseGuards(GatewayAuthGuard)
    async checkEnrollmentStatus(
        @Request() req: ReqWithRequester,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<{ isEnrolled: boolean }> {
        const userId = req.requester.id;
        // This would require injecting EnrollmentService, but for now we'll return a simple response
        // In a full implementation, you'd inject IEnrollmentService here
        return { isEnrolled: false }; // Placeholder
    }

    /**
     * Get course curriculum (modules with lessons)
     */
    @Get(':id/curriculum')
    async getCurriculum(@Param('id', ParseUUIDPipe) id: string) {
        return this.courseService.getCurriculum(id);
    }

    /**
     * Get course by ID
     */
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDTO> {
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
        @Param('id', ParseUUIDPipe) id: string,
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
        @Param('id', ParseUUIDPipe) id: string,
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
        @Param('id', ParseUUIDPipe) id: string,
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
        @Param('id', ParseUUIDPipe) id: string,
        @Query('hardDelete') hardDelete?: string,
    ): Promise<{ message: string }> {
        const isHardDelete = hardDelete === 'true';
        return this.courseService.delete(req.requester, id, isHardDelete);
    }
}
