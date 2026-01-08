import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UsePipes,
    UseGuards,
    Request,
    Inject,
} from '@nestjs/common';
import { ZodValidationPipe, GatewayAuthGuard } from '@server/shared';
import { courseInstructorAssignDTOSchema, courseInstructorUpdateDTOSchema } from '@workspace/schemas';
import type {
    CourseInstructorResponseDTO,
    CourseInstructorAssignDTO,
    CourseInstructorUpdateDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { ICourseInstructorService } from '../interfaces/services';
import { COURSE_INSTRUCTOR_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Course Instructor HTTP Controller
 * Handles lecturer assignment to courses
 */
@Controller('course-instructors')
@UseGuards(GatewayAuthGuard)
export class CourseInstructorController {
    constructor(
        @Inject(COURSE_INSTRUCTOR_SERVICE_TOKEN)
        private readonly courseInstructorService: ICourseInstructorService
    ) { }

    /**
     * Assign lecturer to course
     */
    @Post()
    @UsePipes(new ZodValidationPipe(courseInstructorAssignDTOSchema))
    async assignLecturer(
        @Request() req: ReqWithRequester,
        @Body() dto: CourseInstructorAssignDTO
    ): Promise<CourseInstructorResponseDTO> {
        return this.courseInstructorService.assignLecturer(req.requester, dto);
    }

    /**
     * Get all instructors for a course
     */
    @Get('by-course/:courseId')
    async getInstructorsByCourse(
        @Param('courseId') courseId: string
    ): Promise<CourseInstructorResponseDTO[]> {
        return this.courseInstructorService.getInstructorsByCourse(courseId);
    }

    /**
     * Get all courses for a lecturer
     */
    @Get('by-lecturer/:lecturerId')
    async getCoursesByLecturer(
        @Param('lecturerId') lecturerId: string
    ): Promise<CourseInstructorResponseDTO[]> {
        return this.courseInstructorService.getCoursesByLecturer(lecturerId);
    }

    /**
     * Update primary instructor flag
     */
    @Patch(':id/primary')
    @UsePipes(new ZodValidationPipe(courseInstructorUpdateDTOSchema))
    async updatePrimaryInstructor(
        @Request() req: ReqWithRequester,
        @Param('id') id: string,
        @Body() dto: CourseInstructorUpdateDTO
    ): Promise<CourseInstructorResponseDTO> {
        return this.courseInstructorService.updatePrimaryInstructor(req.requester, id, dto);
    }

    /**
     * Unassign lecturer from course
     */
    @Delete(':id')
    async unassignLecturer(
        @Request() req: ReqWithRequester,
        @Param('id') id: string
    ): Promise<{ message: string }> {
        return this.courseInstructorService.unassignLecturer(req.requester, id);
    }
}
