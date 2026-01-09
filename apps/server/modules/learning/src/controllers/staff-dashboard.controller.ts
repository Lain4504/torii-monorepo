import {
    Controller,
    Get,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { GatewayAuthGuard } from '@server/shared';
import { PrismaService } from '@server/shared';
import type {
    StaffDashboardResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';

/**
 * Staff Dashboard HTTP Controller
 * Provides dashboard metrics for staff members
 */
@Controller('staff/dashboard')
@UseGuards(GatewayAuthGuard)
export class StaffDashboardController {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get staff dashboard metrics
     * Restricted to ADMIN and STAFF roles only
     */
    @Get()
    async getDashboardMetrics(
        @Request() req: ReqWithRequester
    ): Promise<StaffDashboardResponseDTO> {
        // Check permissions - only ADMIN and STAFF can access dashboard
        if (!['ADMIN', 'STAFF'].includes(req.requester.role)) {
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
            this.prisma.user.count({
                where: {
                    role: 'LEARNER',
                    deletedAt: null,
                },
            }),

            // Total unique lecturers
            this.prisma.courseInstructor.findMany({
                select: { lecturerId: true },
                distinct: ['lecturerId'],
            }).then(instructors => instructors.length),
        ]);

        return {
            totalCourses,
            activeCourses,
            totalStudents,
            totalLecturers,
        };
    }
}
