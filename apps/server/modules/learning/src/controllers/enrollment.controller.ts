import {
    Controller,
    Get,
    Post,
    Patch,
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
import type {
    EnrollmentResponseDTO,
    EnrollmentCreateDTO,
    EnrollmentQueryDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { IEnrollmentService } from '../interfaces/services';
import { ENROLLMENT_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Enrollment HTTP Controller
 * Handles enrollment operations
 */
@Controller('enrollments')
@UseGuards(GatewayAuthGuard)
export class EnrollmentController {
    constructor(@Inject(ENROLLMENT_SERVICE_TOKEN) private readonly enrollmentService: IEnrollmentService) { }

    /**
     * Get all enrollments with pagination
     */
    @Get()
    async findAll(@Query() query: EnrollmentQueryDTO): Promise<PaginatedResponseDTO<EnrollmentResponseDTO>> {
        return this.enrollmentService.findAll(query);
    }

    /**
     * Get enrollment by ID
     */
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EnrollmentResponseDTO | null> {
        return this.enrollmentService.findOne(id);
    }

    /**
     * Check if user is enrolled in a course
     */
    @Get('check/:courseId')
    async checkEnrollment(
        @Request() req: ReqWithRequester,
        @Param('courseId', ParseUUIDPipe) courseId: string,
    ): Promise<{ isEnrolled: boolean; enrollment?: EnrollmentResponseDTO }> {
        const userId = req.requester.id;
        const enrollment = await this.enrollmentService.findByUserAndCourse(userId, courseId);
        return {
            isEnrolled: enrollment !== null && enrollment.completionStatus === 'in_progress',
            enrollment: enrollment || undefined,
        };
    }

    /**
     * Create new enrollment
     */
    @Post()
    async create(
        @Request() req: ReqWithRequester,
        @Body() input: EnrollmentCreateDTO,
    ): Promise<EnrollmentResponseDTO> {
        const userId = req.requester.id;
        return this.enrollmentService.create(userId, input);
    }

    /**
     * Update enrollment progress
     */
    @Patch(':id/progress')
    async updateProgress(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('completionPercentage') completionPercentage: number,
    ): Promise<EnrollmentResponseDTO> {
        return this.enrollmentService.updateProgress(id, completionPercentage);
    }
}

