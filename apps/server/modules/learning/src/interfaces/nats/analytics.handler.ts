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

    @MessagePattern({ cmd: 'learning.readinessMetrics' })
    async getReadinessMetrics({ userId }: { userId: string }) {
        const [
            completedLessons,
            examAttempts,
            gamification,
            skillStats
        ] = await Promise.all([
            this.prisma.lessonProgress.count({
                where: {
                    enrollment: { userId },
                    status: 'completed'
                }
            }),
            this.prisma.quizAttempt.count({
                where: {
                    userId,
                    quiz: { quizType: { in: ['jlpt_mock', 'exam'] } }
                }
            }),
            this.prisma.userGamification.findUnique({
                where: { userId },
                select: { currentStreak: true, totalXp: true, level: true }
            }),
            // Group by section type to get skill gaps
            this.prisma.$queryRaw<{ section_type: string, avg_score: number, total_attempts: number }[]>`
                SELECT 
                    qq.section_type,
                    CASE WHEN COUNT(qad.id) > 0 THEN (SUM(CASE WHEN qad.is_correct = true THEN 1 ELSE 0 END)::float / COUNT(qad.id)::float) * 100 ELSE 0 END as avg_score,
                    COUNT(DISTINCT qa.id) as total_attempts
                FROM "QuizAttempt" qa
                JOIN "QuizAttemptDetail" qad ON qad.attempt_id = qa.id
                JOIN "QuizQuestion" qq ON qq.question_id = qad.question_id AND qq.quiz_id = qa.quiz_id
                WHERE qa.user_id = ${userId}::uuid AND qa.status = 'completed'
                GROUP BY qq.section_type
            `
        ]);

        const totalAttempts = skillStats.reduce((sum, s) => sum + Number(s.total_attempts || 0), 0);
        const overallAverage = skillStats.length > 0
            ? skillStats.reduce((sum, s) => sum + Number(s.avg_score || 0), 0) / skillStats.length
            : 0;

        const skills = {
            vocabulary: Number(skillStats.find(s => s.section_type === 'vocab' || s.section_type === 'vocabulary')?.avg_score || 0),
            grammar: Number(skillStats.find(s => s.section_type === 'grammar')?.avg_score || 0),
            reading: Number(skillStats.find(s => s.section_type === 'reading')?.avg_score || 0),
            listening: Number(skillStats.find(s => s.section_type === 'listening')?.avg_score || 0),
        };

        return {
            completedLessons,
            averageScore: overallAverage,
            attemptedQuizzes: Math.max(0, ...skillStats.map(s => Number(s.total_attempts))), // approximate distinct attempts
            attemptedExams: examAttempts,
            streak: gamification?.currentStreak || 0,
            totalXp: gamification?.totalXp || 0,
            learningLevel: gamification?.level || 1,
            skills,
            timestamp: new Date().toISOString()
        };
    }
}
