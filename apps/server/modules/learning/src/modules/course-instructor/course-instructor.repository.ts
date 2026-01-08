import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { CourseInstructor, Prisma } from '@prisma/generated';
import type { ICourseInstructorRepository } from '../../interfaces/repositories';

/**
 * Course Instructor Repository
 * Handles all database operations for CourseInstructor entity
 */
@Injectable()
export class CourseInstructorRepository implements ICourseInstructorRepository {
    private readonly logger = new Logger(CourseInstructorRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find course instructor assignment by ID
     */
    async findById(id: string): Promise<CourseInstructor | null> {
        return this.prisma.courseInstructor.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnailUrl: true,
                        status: true,
                    },
                },
            },
        });
    }

    /**
     * Find all instructors for a course
     */
    async findByCourseId(courseId: string): Promise<CourseInstructor[]> {
        return this.prisma.courseInstructor.findMany({
            where: { courseId },
            orderBy: [
                { isPrimary: 'desc' }, // Primary instructors first
                { assignedDate: 'asc' },
            ],
        });
    }

    /**
     * Find all courses for a lecturer
     */
    async findByLecturerId(lecturerId: string): Promise<CourseInstructor[]> {
        return this.prisma.courseInstructor.findMany({
            where: { lecturerId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnailUrl: true,
                        status: true,
                        totalStudents: true,
                    },
                },
            },
            orderBy: [
                { isPrimary: 'desc' },
                { assignedDate: 'desc' },
            ],
        });
    }

    /**
     * Check if lecturer is assigned to a course
     */
    async checkAssignment(courseId: string, lecturerId: string): Promise<boolean> {
        const assignment = await this.prisma.courseInstructor.findFirst({
            where: {
                courseId,
                lecturerId,
            },
        });
        return !!assignment;
    }

    /**
     * Assign lecturer to course
     */
    async assign(data: Prisma.CourseInstructorCreateInput): Promise<CourseInstructor> {
        return this.prisma.courseInstructor.create({
            data,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnailUrl: true,
                        status: true,
                    },
                },
            },
        });
    }

    /**
     * Update primary instructor flag
     */
    async updatePrimary(id: string, isPrimary: boolean): Promise<CourseInstructor> {
        return this.prisma.courseInstructor.update({
            where: { id },
            data: { isPrimary },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        thumbnailUrl: true,
                        status: true,
                    },
                },
            },
        });
    }

    /**
     * Unassign lecturer from course
     */
    async unassign(id: string): Promise<void> {
        await this.prisma.courseInstructor.delete({
            where: { id },
        });
    }

    /**
     * Count unique lecturers in the system
     */
    async countUniqueLecturers(): Promise<number> {
        const result = await this.prisma.courseInstructor.findMany({
            select: { lecturerId: true },
            distinct: ['lecturerId'],
        });
        return result.length;
    }
}
