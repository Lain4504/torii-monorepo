import { Controller, ForbiddenException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';

@Controller()
export class StaffDashboardHandler {
    constructor(private readonly prisma: PrismaService) { }

    @MessagePattern({ cmd: 'learning.staff-dashboard.getMetrics' })
    async getMetrics(@Payload() data: { userId: string, role: string }) {
        const { role } = data;

        // Check permissions - only ADMIN and STAFF can access dashboard
        if (!['ADMIN', 'STAFF'].includes(role)) {
            throw new ForbiddenException('Only admins and staff can access the dashboard');
        }

        // Aggregate metrics from database
        const [
            totalCourses,
            activeCourses,
            totalStudents,
            totalLecturers,
        ] = await Promise.all([
            // Total courses (including drafts, excluding deleted)
            this.prisma.course.count({
                where: { deletedAt: null },
            }),

            // Active/Published courses
            this.prisma.course.count({
                where: {
                    status: 'published',
                    deletedAt: null,
                },
            }),

            // Total enrolled students (distinct user_ids)
            // Note: Assuming an 'enrollments' table exists. Adjust if needed.
            // Using User count with role LEARNER as per original logic
            this.prisma.user.count({
                where: {
                    role: 'LEARNER',
                    deletedAt: null,
                },
            }),

            // Total unique lecturers assigned to courses
            this.prisma.course.findMany({
                where: { lecturerId: { not: null }, deletedAt: null },
                select: { lecturerId: true },
                distinct: ['lecturerId'],
            }).then(lecturers => lecturers.length),
        ]);

        return {
            totalCourses,
            activeCourses,
            totalStudents,
            totalLecturers,
        };
    }
}
