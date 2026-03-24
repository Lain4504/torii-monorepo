import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { EnrollmentCreateDto, EnrollmentQueryDto } from './dto/enrollment.dto';
import { AuditLoggerService } from '../../audit-logger.service';
import { AchievementService } from '../../gamification/achievement.service';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
    private readonly achievementService: AchievementService,
  ) {}

  async findAll(query: any) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId: query.userId ?? undefined,
        status: query.status ?? undefined,
      },
      include: {
        user: {
          select: { id: true, displayName: true, email: true, avatarUrl: true },
        },
        vodPackage: {
          select: {
            id: true,
            title: true,
            code: true,
            courseProfileId: true,
            courseProfile: {
              select: { id: true, title: true, code: true, thumbnailUrl: true },
            },
          },
        },
        liveClass: {
          include: {
            instructor: { select: { displayName: true, avatarUrl: true } },
            cohort: {
              include: {
                courseProfile: {
                  select: {
                    id: true,
                    title: true,
                    code: true,
                    thumbnailUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ enrolledAt: 'desc' }],
    });

    if (query.userId) {
      return Promise.all(
        enrollments.map(async (e) => {
          let progressPercent = 0;
          let completedLessons = 0;
          let totalLessons = 0;

          if (e.liveClassId || e.vodPackageId) {
            // Find lessons from course profile
            const cpId =
              e.liveClass?.cohort?.courseProfileId ||
              e.vodPackage?.courseProfileId;
            if (cpId) {
              totalLessons = await this.prisma.lesson.count({
                where: { module: { courseProfileId: cpId } },
              });
              completedLessons = await this.prisma.userLessonProgress.count({
                where: {
                  userId: e.userId,
                  enrollmentId: e.id,
                  isCompleted: true,
                },
              });
              progressPercent =
                totalLessons > 0
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0;
            }
          }

          const instructor = e.liveClass?.instructor;
          const courseProfile =
            e.liveClass?.cohort?.courseProfile ?? e.vodPackage?.courseProfile;

          return {
            id: e.id,
            status: e.status,
            enrolledAt: e.enrolledAt,
            expiresAt: e.expiresAt,
            vodPackageId: e.vodPackageId,
            liveClassId: e.liveClassId,
            type: e.liveClassId ? 'live' : 'vod',
            courseTitle: courseProfile?.title,
            courseCode: courseProfile?.code,
            thumbnailUrl: courseProfile?.thumbnailUrl,
            instructor,
            progressPercent,
            completedLessons,
            totalLessons,
          };
        }),
      );
    }
    return enrollments;
  }

  async findById(id: string) {
    const item = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        liveClass: {
          include: {
            instructor: { select: { displayName: true } },
            cohort: {
              include: {
                courseProfile: { select: { title: true, code: true } },
              },
            },
          },
        },
        vodPackage: {
          select: {
            id: true,
            title: true,
            code: true,
            courseProfile: { select: { title: true, code: true } },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Enrollment not found');
    return item;
  }

  async findByUserId(userId: string) {
    return this.findAll({ userId });
  }

  async getStatsForUser(userId: string) {
    const list = await this.findAll({ userId, status: 'ACTIVE' });
    let sumProgress = 0,
      completedCourses = 0,
      inProgressCourses = 0,
      totalLearningHours = 0;
    const MINUTES_PER_LESSON = 15;

    for (const r of list as any[]) {
      const p = r.progressPercent ?? 0;
      sumProgress += p;
      if (p >= 100) completedCourses++;
      else if (p > 0) inProgressCourses++;
      const cl = r.completedLessons ?? 0;
      totalLearningHours += (cl * MINUTES_PER_LESSON) / 60;
    }
    return {
      totalCourses: list.length,
      completedCourses,
      inProgressCourses,
      averageProgress:
        list.length > 0 ? Math.round(sumProgress / list.length) : 0,
      totalLearningHours: Math.round(totalLearningHours * 10) / 10,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
      streak: 0,
      level: 1,
      xp: 0,
      onboarding: { dailyGoal: 3 },
    };
  }

  async enroll(input: any, requesterId = 'SYSTEM') {
    // Determine type
    if (!input.liveClassId && !input.vodPackageId)
      throw new BadRequestException('liveClassId or vodPackageId required');
    const existing = await this.prisma.enrollment.findFirst({
      where: {
        userId: input.userId,
        OR: [
          { liveClassId: input.liveClassId || 'dummy' },
          { vodPackageId: input.vodPackageId || 'dummy' },
        ],
      },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('User is already enrolled');

    return this.prisma.$transaction(async (tx) => {
      if (input.liveClassId) {
        const liveClass = await tx.liveClass.findUnique({
          where: { id: input.liveClassId },
          select: { maxStudents: true },
        });
        if (liveClass?.maxStudents) {
          const count = await tx.enrollment.count({
            where: { liveClassId: input.liveClassId, status: 'ACTIVE' },
          });
          if (count >= liveClass.maxStudents)
            throw new BadRequestException('Class is full');
        }
      }

      const enrollment = await tx.enrollment.create({
        data: {
          userId: input.userId,
          liveClassId: input.liveClassId,
          vodPackageId: input.vodPackageId,
          status: 'ACTIVE',
        },
      });
      return enrollment;
    });
  }

  async cancelEnrollment(id: string, requesterId = 'SYSTEM') {
    return this.prisma.enrollment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async completeEnrollment(id: string, requesterId = 'SYSTEM') {
    return this.prisma.enrollment.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  async checkEligibility(
    userId: string,
    targetId: string,
    targetType: 'CLASS' | 'COURSE',
  ) {
    const where =
      targetType === 'CLASS'
        ? { userId, liveClassId: targetId }
        : { userId, vodPackageId: targetId };
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { ...where, status: { in: ['ACTIVE', 'COMPLETED'] } },
    });
    return {
      isEnrolled: !!enrollment,
      enrollmentStatus: enrollment?.status ?? null,
    };
  }
}
