import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';

@Controller()
export class AnalyticsHandler {
  constructor(private readonly prisma: PrismaService) {}

  @MessagePattern({ cmd: 'learning.analytics.overview' })
  async getOverview() {
    const [
      totalCourses,
      totalEnrollments,
      popularCourses,
      pendingApprovals,
      activeRooms,
    ] = await Promise.all([
      this.prisma.courseMaster.count({ where: { deletedAt: null } }),
      this.prisma.enrollment.count(),
      this.prisma.courseMaster.findMany({
        where: { deletedAt: null, status: 'APPROVED' },
        take: 5,
        select: {
          id: true,
          title: true,
          jlptLevel: true,
        },
      }),
      this.prisma.courseMaster.count({
        where: {
          status: 'PENDING_REVIEW',
          deletedAt: null,
        },
      }),
      this.prisma.roomInfo.count({
        where: { isRunning: 1 },
      }),
    ]);

    return {
      totalCourses,
      totalEnrollments,
      popularCourses,
      pendingApprovals,
      activeRooms,
    };
  }

  @MessagePattern({ cmd: 'learning.analytics.courses' })
  async getCourseStats() {
    const [statsByLevel, enrollmentByStatus, completionStats] =
      await Promise.all([
        this.prisma.courseMaster.groupBy({
          by: ['jlptLevel'],
          _count: { _all: true },
          where: { deletedAt: null },
        }),
        this.prisma.enrollment.groupBy({
          by: ['enrollmentStatus'],
          _count: { _all: true },
        }),
        this.prisma.enrollment.aggregate({
          _avg: { completionPercentage: true },
          where: { enrollmentStatus: 'ACTIVE' },
        }),
      ]);

    return {
      statsByLevel: statsByLevel.map((s) => ({
        level: s.jlptLevel,
        count: s._count._all,
      })),
      enrollmentByStatus: enrollmentByStatus.map((e) => ({
        status: e.enrollmentStatus,
        count: e._count._all,
      })),
      averageCompletion: Number(
        completionStats._avg?.completionPercentage || 0,
      ),
    };
  }

  @MessagePattern({ cmd: 'learning.readinessMetrics' })
  async getReadinessMetrics({ userId }: { userId: string }) {
    const [completedLessons, quizStats, examAttempts, gamification] =
      await Promise.all([
        this.prisma.lessonProgress.count({
          where: {
            enrollment: { userId },
            status: 'completed',
          },
        }),
        this.prisma.quizAttempt.aggregate({
          where: { userId, status: 'completed' },
          _avg: { percentage: true },
          _count: { _all: true },
        }),
        this.prisma.quizAttempt.count({
          where: {
            userId,
            quiz: { quizType: { in: ['jlpt_mock', 'exam'] } },
          },
        }),
        this.prisma.userGamification.findUnique({
          where: { userId },
          select: { currentStreak: true, totalXp: true, level: true },
        }),
      ]);

    return {
      completedLessons,
      averageScore: Number(quizStats._avg.percentage || 0),
      attemptedQuizzes: quizStats._count._all,
      attemptedExams: examAttempts,
      streak: gamification?.currentStreak || 0,
      totalXp: gamification?.totalXp || 0,
      learningLevel: gamification?.level || 1,
      timestamp: new Date().toISOString(),
    };
  }
}
