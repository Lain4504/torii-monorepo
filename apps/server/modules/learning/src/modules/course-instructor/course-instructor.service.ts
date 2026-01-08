import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import type { CourseInstructor } from '@prisma/generated';

import type {
    CourseInstructorResponseDTO,
    CourseInstructorAssignDTO,
    CourseInstructorUpdateDTO,
    Requester,
} from '@workspace/schemas';

import type { ICourseInstructorService } from '../../interfaces/services';
import type { ICourseInstructorRepository } from '../../interfaces/repositories';
import { COURSE_INSTRUCTOR_REPOSITORY_TOKEN } from '../../interfaces/repositories';

/**
 * Course Instructor Service
 * Handles course instructor assignment business logic
 */
@Injectable()
export class CourseInstructorService implements ICourseInstructorService {
    private readonly logger = new Logger(CourseInstructorService.name);

    constructor(
        @Inject(COURSE_INSTRUCTOR_REPOSITORY_TOKEN)
        private readonly courseInstructorRepository: ICourseInstructorRepository,
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Map CourseInstructor entity to CourseInstructorResponseDTO
     */
    private async toCourseInstructorResponseDTO(instructor: CourseInstructor & { course?: any }): Promise<CourseInstructorResponseDTO> {
        const response: CourseInstructorResponseDTO = {
            id: instructor.id,
            courseId: instructor.courseId,
            lecturerId: instructor.lecturerId,
            isPrimary: instructor.isPrimary,
            assignedDate: instructor.assignedDate,
        };

        // Populate lecturer details if needed
        const lecturer = await this.prisma.user.findUnique({
            where: { id: instructor.lecturerId },
            select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
            },
        });

        if (lecturer) {
            response.lecturer = lecturer;
        }

        // Add course details if already populated
        if (instructor.course) {
            response.course = instructor.course;
        }

        return response;
    }

    /**
     * Assign a lecturer to a course
     */
    async assignLecturer(requester: Requester, dto: CourseInstructorAssignDTO): Promise<CourseInstructorResponseDTO> {
        // Check permissions - only ADMIN and STAFF can assign lecturers
        if (!['ADMIN', 'STAFF'].includes(requester.role)) {
            throw new ForbiddenException('Only admins and staff can assign lecturers to courses');
        }

        try {
            // Verify course exists
            const course = await this.prisma.course.findUnique({
                where: { id: dto.courseId },
            });

            if (!course || course.deletedAt) {
                throw new NotFoundException(`Course with id ${dto.courseId} not found`);
            }

            // Verify lecturer exists and has LECTURER role
            const lecturer = await this.prisma.user.findUnique({
                where: { id: dto.lecturerId },
            });

            if (!lecturer || lecturer.deletedAt) {
                throw new NotFoundException(`Lecturer with id ${dto.lecturerId} not found`);
            }

            if (lecturer.role !== 'LECTURER') {
                throw new BadRequestException('User must have LECTURER role to be assigned as an instructor');
            }

            // Check if lecturer is already assigned to this course
            const existingAssignment = await this.courseInstructorRepository.checkAssignment(
                dto.courseId,
                dto.lecturerId
            );

            if (existingAssignment) {
                throw new BadRequestException('Lecturer is already assigned to this course');
            }

            // Create the assignment
            const assignment = await this.courseInstructorRepository.assign({
                course: { connect: { id: dto.courseId } },
                lecturerId: dto.lecturerId,
                isPrimary: dto.isPrimary ?? false,
            });

            // Emit NATS event for audit
            try {
                this.natsClient.emit(
                    { cmd: 'course.instructor.assigned' },
                    {
                        courseId: dto.courseId,
                        lecturerId: dto.lecturerId,
                        isPrimary: dto.isPrimary,
                        assignedBy: requester.sub,
                    }
                );
            } catch (error: any) {
                this.logger.error(`Failed to emit course.instructor.assigned event: ${error?.message}`, error);
            }

            return this.toCourseInstructorResponseDTO(assignment);
        } catch (error: any) {
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error('Error assigning lecturer to course', error);
            throw new BadRequestException(`Failed to assign lecturer: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Get all instructors for a course
     */
    async getInstructorsByCourse(courseId: string): Promise<CourseInstructorResponseDTO[]> {
        // Verify course exists
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course || course.deletedAt) {
            throw new NotFoundException(`Course with id ${courseId} not found`);
        }

        const instructors = await this.courseInstructorRepository.findByCourseId(courseId);
        return Promise.all(instructors.map(instructor => this.toCourseInstructorResponseDTO(instructor)));
    }

    /**
     * Get all courses assigned to a lecturer
     */
    async getCoursesByLecturer(lecturerId: string): Promise<CourseInstructorResponseDTO[]> {
        const assignments = await this.courseInstructorRepository.findByLecturerId(lecturerId);
        return Promise.all(assignments.map(assignment => this.toCourseInstructorResponseDTO(assignment)));
    }

    /**
     * Update the primary instructor flag
     */
    async updatePrimaryInstructor(requester: Requester, instructorId: string, dto: CourseInstructorUpdateDTO): Promise<CourseInstructorResponseDTO> {
        // Check permissions
        if (!['ADMIN', 'STAFF'].includes(requester.role)) {
            throw new ForbiddenException('Only admins and staff can update instructor assignments');
        }

        const existing = await this.courseInstructorRepository.findById(instructorId);

        if (!existing) {
            throw new NotFoundException(`Course instructor assignment with id ${instructorId} not found`);
        }

        try {
            const updated = await this.courseInstructorRepository.updatePrimary(instructorId, dto.isPrimary);
            return this.toCourseInstructorResponseDTO(updated);
        } catch (error: any) {
            this.logger.error('Error updating primary instructor flag', error);
            throw new BadRequestException(`Failed to update instructor: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Unassign a lecturer from a course
     */
    async unassignLecturer(requester: Requester, instructorId: string): Promise<{ message: string }> {
        // Check permissions
        if (!['ADMIN', 'STAFF'].includes(requester.role)) {
            throw new ForbiddenException('Only admins and staff can unassign lecturers');
        }

        const existing = await this.courseInstructorRepository.findById(instructorId);

        if (!existing) {
            throw new NotFoundException(`Course instructor assignment with id ${instructorId} not found`);
        }

        try {
            await this.courseInstructorRepository.unassign(instructorId);

            // Emit NATS event for audit
            try {
                this.natsClient.emit(
                    { cmd: 'course.instructor.unassigned' },
                    {
                        courseId: existing.courseId,
                        lecturerId: existing.lecturerId,
                        unassignedBy: requester.sub,
                    }
                );
            } catch (error: any) {
                this.logger.error(`Failed to emit course.instructor.unassigned event: ${error?.message}`, error);
            }

            return { message: 'Lecturer unassigned successfully' };
        } catch (error: any) {
            this.logger.error('Error unassigning lecturer', error);
            throw new BadRequestException(`Failed to unassign lecturer: ${error?.message || 'Unknown error'}`);
        }
    }
}
