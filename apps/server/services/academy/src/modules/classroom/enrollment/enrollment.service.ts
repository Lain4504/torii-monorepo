import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { EnrollmentCreateDto, EnrollmentQueryDto } from './dto/enrollment.dto';
import { AuditLoggerService } from '../../audit-logger.service';
import { AchievementService } from '../../gamification/achievement.service';
import { GamificationService } from '../../gamification/gamification.service';
import { ActivityType } from '@prisma/generated';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
    private readonly achievementService: AchievementService,
    private readonly gamificationService: GamificationService,
    @Inject('NATS_SERVICE') private readonly nats: ClientProxy,
  ) { }

  private readonly logger = new Logger(EnrollmentService.name);

  async findAll(query: any) {
    const where: any = {
      userId: query.userId ?? undefined,
      status: query.status ?? undefined,
    };

    // Smart Bridge logic: if a generic ID is provided, check both liveClassId and vodPackageId
    if (query.liveClassId) {
      where.liveClassId = query.liveClassId;
    } else if (query.vodPackageId) {
      where.vodPackageId = query.vodPackageId;
    } else if (query.classId || query.courseId) {
      const targetId = query.classId || query.courseId;
      where.OR = [{ liveClassId: targetId }, { vodPackageId: targetId }];
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where,

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

    // Self-heal EXPIRED status
    const now = new Date();
    for (const e of enrollments) {
      if (e.status === 'ACTIVE' && e.expiresAt && e.expiresAt < now) {
        try {
          await this.prisma.enrollment.update({
            where: { id: e.id },
            data: { status: 'EXPIRED' },
          });
          e.status = 'EXPIRED';
        } catch (err) {
          this.logger.error(`Failed to self-heal enrollment ${e.id} to EXPIRED`, err);
        }
      }
    }

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

          // Use specific instance title if available, otherwise fallback to course profile title
          const courseTitle = e.liveClass?.name || e.vodPackage?.title || courseProfile?.title;

          return {
            id: e.id,
            status: e.status,
            enrolledAt: e.enrolledAt,
            expiresAt: e.expiresAt,
            vodPackageId: e.vodPackageId,
            liveClassId: e.liveClassId,
            cohortId: e.liveClass?.cohortId,
            type: e.liveClassId ? 'live' : 'vod',
            courseTitle,
            courseCode: courseProfile?.code,
            thumbnailUrl: courseProfile?.thumbnailUrl,
            instructor,
            progress: progressPercent,
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

    if (item.status === 'ACTIVE' && item.expiresAt && item.expiresAt < new Date()) {
      try {
        await this.prisma.enrollment.update({
          where: { id: item.id },
          data: { status: 'EXPIRED' },
        });
        item.status = 'EXPIRED';
      } catch (err) {
        this.logger.error(`Failed to self-heal enrollment ${item.id} to EXPIRED`, err);
      }
    }

    return item;
  }

  async findByUserId(userId: string) {
    return this.findAll({ userId });
  }

  async getStatsForUser(userId: string) {
    const list = await this.findAll({
      userId,
      status: { in: ['ACTIVE', 'COMPLETED'] },
    });
    let sumProgress = 0,
      completedCourses = 0,
      inProgressCourses = 0,
      totalLearningHours = 0;
    const MINUTES_PER_LESSON = 15;

    for (const r of list as any[]) {
      let p = r.progressPercent ?? 0;

      // Self-healing: If ACTIVE but 100%, transition to COMPLETED
      if (r.status === 'ACTIVE' && p >= 100) {
        try {
          await this.prisma.enrollment.update({
            where: { id: r.id },
            data: { status: 'COMPLETED' },
          });
          r.status = 'COMPLETED'; // Update local object for stats
          // Emit event to trigger certificate generation
          this.nats.emit('enrollment.completed', { enrollmentId: r.id });
          this.logger.log(`Self-healed enrollment ${r.id} to COMPLETED`);
        } catch (err) {
          this.logger.error(`Failed to self-heal enrollment ${r.id}:`, err);
        }
      }

      sumProgress += p;
      if (r.status === 'COMPLETED' || p >= 100) completedCourses++;
      else if (p > 0) inProgressCourses++;

      const cl = r.completedLessons ?? 0;
      totalLearningHours += (cl * MINUTES_PER_LESSON) / 60;
    }

    // Fetch real gamification data
    const gProfile = await this.gamificationService.getProfile(userId);
    const gStreak = await this.gamificationService.getStreakStatus(userId);

    // Calculate weekly activity (last 7 days)
    const weeklyActivity = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    // In Vietnam time (Asia/Ho_Chi_Minh)
    const vnToday = new Date(
      today.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
    );

    // Get the Monday of the current week
    const dayOfWeek = vnToday.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(vnToday);
    monday.setDate(vnToday.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      if (gStreak.recentActiveDates.includes(dStr)) {
        // Count how many lessons completed on this day in history
        const count = await this.prisma.gamificationHistory.count({
          where: {
            userId,
            activityType: ActivityType.LESSON_COMPLETE,
            createdAt: {
              gte: new Date(`${dStr}T00:00:00.000Z`),
              lte: new Date(`${dStr}T23:59:59.999Z`),
            },
          },
        });
        weeklyActivity[i] = count;
      }
    }

    return {
      totalCourses: list.length,
      completedCourses,
      inProgressCourses,
      averageProgress:
        list.length > 0 ? Math.round(sumProgress / list.length) : 0,
      totalLearningHours: Math.round(totalLearningHours * 10) / 10,
      weeklyActivity,
      streak: gStreak.currentStreak,
      level: gProfile.level,
      xp: gProfile.totalXp,
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
        liveClassId: input.liveClassId || undefined,
        vodPackageId: input.vodPackageId || undefined,
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
          expiresAt: input.expiresAt,
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
      include: {
        liveClass: { include: { cohort: true } },
        vodPackage: true,
      },
    });

    if (!enrollment) {
      return { isEnrolled: false, enrollment: null };
    }

    if (enrollment.status === 'ACTIVE' && enrollment.expiresAt && enrollment.expiresAt < new Date()) {
      try {
        await this.prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'EXPIRED' },
        });
      } catch (err) {
        this.logger.error(`Failed to self-heal enrollment ${enrollment.id} to EXPIRED`, err);
      }
      return { isEnrolled: false, enrollment: null };
    }

    // Calculate progress for metadata
    const cpId = enrollment.liveClass?.cohort?.courseProfileId || enrollment.vodPackage?.courseProfileId;
    let progress = 0;
    if (cpId) {
      const totalLessons = await this.prisma.lesson.count({
        where: { module: { courseProfileId: cpId } },
      });
      const completedCount = await this.prisma.userLessonProgress.count({
        where: {
          enrollmentId: enrollment.id,
          isCompleted: true,
        },
      });
      progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    }

    return {
      isEnrolled: true,
      enrollment: {
        ...enrollment,
        progress,
        enrollmentDate: enrollment.enrolledAt, // Alias for legacy ticket service compatibility
      },
    };
  }

  async trackLessonProgress(userId: string, targetId: string, lessonId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        OR: [{ vodPackageId: targetId }, { liveClassId: targetId }],
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      include: {
        liveClass: { include: { cohort: true } },
        vodPackage: true,
      },
    });

    if (!enrollment) {
      throw new BadRequestException('User is not enrolled or enrollment is inactive');
    }

    if (enrollment.status === 'ACTIVE' && enrollment.expiresAt && enrollment.expiresAt < new Date()) {
      try {
        await this.prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'EXPIRED' },
        });
      } catch (err) {
        this.logger.error(`Failed to self-heal enrollment ${enrollment.id} to EXPIRED`, err);
      }
      throw new BadRequestException('User enrollment has expired');
    }

    const progress = await this.prisma.userLessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        lastWatchedAt: new Date(),
      },
      create: {
        userId,
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: true,
        lastWatchedAt: new Date(),
      },
    });

    // Fetch title for history
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { title: true },
    });

    let courseTitle = 'Khóa học';
    if (enrollment.liveClassId) {
      const liveClass = await this.prisma.liveClass.findUnique({
        where: { id: enrollment.liveClassId },
        select: { name: true },
      });
      courseTitle = liveClass?.name || courseTitle;
    } else if (enrollment.vodPackageId) {
      const vod = await this.prisma.vodPackage.findUnique({
        where: { id: enrollment.vodPackageId },
        select: { title: true },
      });
      courseTitle = vod?.title || courseTitle;
    }

    // Award XP and update streak via GamificationService
    await this.gamificationService.trackActivity(
      userId,
      ActivityType.LESSON_COMPLETE,
      {
        lessonId,
        lessonTitle: lesson?.title,
        courseTitle,
        enrollmentId: enrollment.id,
        targetId,
      },
    );

    // Recalculate progress to check for completion
    const cpId = enrollment.liveClass?.cohort?.courseProfileId || enrollment.vodPackage?.courseProfileId;
    if (cpId) {
      const totalLessons = await this.prisma.lesson.count({
        where: { module: { courseProfileId: cpId } },
      });
      const completedCount = await this.prisma.userLessonProgress.count({
        where: {
          enrollmentId: enrollment.id,
          isCompleted: true,
        },
      });

      if (totalLessons > 0 && completedCount >= totalLessons && enrollment.status !== 'COMPLETED') {
        // Mark enrollment as completed
        await this.prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'COMPLETED' },
        });

        // Emit enrollment.completed event to trigger certificate generation
        this.nats.emit('enrollment.completed', { enrollmentId: enrollment.id });
      }
    }

    return { success: true, progress };
  }

  async getCompletedLessons(userId: string, targetId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        OR: [{ vodPackageId: targetId }, { liveClassId: targetId }],
      },
    });

    if (!enrollment) return [];

    const completed = await this.prisma.userLessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
      },
      select: { lessonId: true },
    });

    return completed.map(c => c.lessonId);
  }

  async updateStatus(id: string, status: string, requesterId = 'SYSTEM') {
    const enrollment = await this.prisma.enrollment.update({
      where: { id },
      data: { status },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'enrollment.update_status',
      entity: 'Enrollment',
      entityId: id,
      description: `Updated enrollment status to ${status}`,
      newValues: { status },
    });

    return enrollment;
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const enrollment = await this.findById(id);
    await this.prisma.enrollment.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'enrollment.delete',
      entity: 'Enrollment',
      entityId: id,
      description: `Deleted enrollment for user ${enrollment.userId}`,
      metadata: { userId: enrollment.userId, liveClassId: enrollment.liveClassId, vodPackageId: enrollment.vodPackageId },
    });
    return { ok: true };
  }

  async checkGiftRecipient(recipientEmail: string, targetId: string) {
    // 1. Check if user exists
    let user: any = null;
    try {
      const response = await firstValueFrom<{ user: any }>(
        this.nats.send({ cmd: 'identity.users.findByEmail' }, { email: recipientEmail }),
      );
      user = response?.user;
    } catch (err) {
      this.logger.error(`Failed to find user by email ${recipientEmail}: ${err.message}`);
    }

    if (!user) {
      return { isRegistered: false, isEnrolled: false };
    }

    // 2. Check if already enrolled in the specific course/cohort
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        OR: [
          { liveClassId: targetId },
          { vodPackageId: targetId },
          { liveClass: { cohortId: targetId } },
        ],
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
    });

    return {
      isRegistered: true,
      isEnrolled: !!enrollment,
      recipientName: user.displayName,
      recipientId: user.id,
    };
  }
}
