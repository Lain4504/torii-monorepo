import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';

@Controller()
export class AnalyticsHandler {
    constructor(private readonly prisma: PrismaService) { }

    @MessagePattern({ cmd: 'learning.analytics.overview' })
    async getOverview() {
        const [totalCourses, totalEnrollments, popularCourses, pendingApprovals, activeRooms] = await Promise.all([
            this.prisma.course.count({ where: { deletedAt: null } }),
            this.prisma.enrollment.count(),
            this.prisma.course.findMany({
                where: { deletedAt: null, status: 'published' },
                orderBy: { totalStudents: 'desc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    totalStudents: true,
                    jlptLevel: true,
                    thumbnailUrl: true
                }
            }),
            this.prisma.course.count({
                where: {
                    status: 'pending_review',
                    deletedAt: null
                }
            }),
            this.prisma.roomInfo.count({
                where: { isRunning: 1 }
            })
        ]);

        return { totalCourses, totalEnrollments, popularCourses, pendingApprovals, activeRooms };
    }

    @MessagePattern({ cmd: 'learning.analytics.courses' })
    async getCourseStats() {
        const [statsByLevel, enrollmentByStatus, completionStats] = await Promise.all([
            this.prisma.course.groupBy({
                by: ['jlptLevel'],
                _count: { _all: true },
                where: { deletedAt: null }
            }),
            this.prisma.enrollment.groupBy({
                by: ['completionStatus'],
                _count: { _all: true }
            }),
            this.prisma.enrollment.aggregate({
                _avg: { completionPercentage: true },
                where: { completionStatus: 'in_progress' }
            })
        ]);

        return {
            statsByLevel: statsByLevel.map(s => ({ level: s.jlptLevel, count: s._count._all })),
            enrollmentByStatus: enrollmentByStatus.map(e => ({ status: e.completionStatus, count: e._count._all })),
            averageCompletion: Number(completionStats._avg.completionPercentage || 0)
        };
    }
}
