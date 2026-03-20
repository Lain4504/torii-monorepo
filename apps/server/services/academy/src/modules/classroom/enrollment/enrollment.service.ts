import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { Prisma } from '@prisma/generated';
import { EnrollmentCreateDto, EnrollmentQueryDto } from './dto/enrollment.dto';
import { AuditLoggerService } from '../../audit-logger.service';
import { AchievementService } from '../../gamification/achievement.service';

/**
 * EnrollmentService - Manages student cohorts and course access.
 * Refactored to link directly to CourseProfile.
 */
@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
    private readonly achievementService: AchievementService,
  ) {}

  // ==============================================================
  // FIND
  // ==============================================================

  async findAll(query: EnrollmentQueryDto) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        classId: query.classId ?? undefined,
        offeringId: query.offeringId ?? undefined,
        userId: query.userId ?? undefined,
        status: query.status ?? undefined,
      },
      include: {
        offering: {
          select: { id: true, mode: true, title: true, code: true },
        },
        class: {
          include: {
            instructor: {
              select: { displayName: true, avatarUrl: true },
            },
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
      orderBy: [{ enrolledAt: 'desc' }],
    });

    if (query.userId) {
      return Promise.all(
        enrollments.map(async (e) => {
          const classId = e.classId;
          let progressPercent = 0;
          let completedLessons = 0;
          let totalLessons = 0;

          if (classId) {
            totalLessons = await this.prisma.lesson.count({
              where: {
                module: {
                  courseProfile: { classes: { some: { id: classId } } },
                },
              },
            });

            completedLessons = await this.prisma.userLessonProgress.count({
              where: { userId: e.userId, classId, isCompleted: true },
            });

            progressPercent =
              totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;
          }

          const instructor = e.class?.instructor;
          const courseProfile = e.class?.courseProfile;

          return {
            id: e.id,
            status: e.status,
            enrolledAt: e.enrolledAt,
            expiresAt: e.expiresAt,
            offeringId: e.offeringId,
            classId: e.classId,
            type: (e.offering?.mode ?? e.class?.mode)?.toLowerCase(),
            mode: e.offering?.mode ?? e.class?.mode,
            courseTitle: e.class?.name ?? courseProfile?.title,
            courseCode: e.class?.code ?? courseProfile?.code,
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
        class: {
          include: {
            instructor: { select: { displayName: true } },
            courseProfile: { select: { title: true, code: true, level: true } },
          },
        },
        offering: { select: { title: true, mode: true } },
      },
    });
    if (!item) throw new NotFoundException('Enrollment not found');
    return item;
  }

  async findByUserId(userId: string) {
    return this.findAll({ userId } as any);
  }

  // ==============================================================
  // ENROLLMENT LIFECYCLE
  // ==============================================================

  async enroll(input: EnrollmentCreateDto, requesterId = 'SYSTEM') {
    const existing = await this.prisma.enrollment.findFirst({
      where: {
        userId: input.userId,
        classId: input.classId,
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('User is already enrolled in this class');
    }

    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true, code: true, mode: true, status: true },
    });
    if (!klass) throw new NotFoundException('Class not found');

    if (klass.status === 'ARCHIVED') {
      throw new BadRequestException('Cannot enroll in an archived class');
    }

    return this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          userId: input.userId,
          classId: input.classId,
          offeringId: input.offeringId ?? undefined,
          status: 'ACTIVE',
        },
      });

      await this.audit.log({
        userId: requesterId,
        action: 'enrollment.create',
        entity: 'Enrollment',
        entityId: enrollment.id,
        description: `Enrolled user ${input.userId} to class ${klass.code}`,
        metadata: { classId: input.classId, offeringId: input.offeringId },
      });

      return enrollment;
    });
  }

  async cancelEnrollment(id: string, requesterId = 'SYSTEM') {
    const before = await this.findById(id);

    const item = await this.prisma.enrollment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'enrollment.cancel',
      entity: 'Enrollment',
      entityId: id,
      description: `Cancelled enrollment ${id}`,
      oldValues: before,
      newValues: item,
    });

    return item;
  }

  async completeEnrollment(id: string, requesterId = 'SYSTEM') {
    const before = await this.findById(id);

    const item = await this.prisma.enrollment.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'enrollment.complete',
      entity: 'Enrollment',
      entityId: id,
      description: `Marked enrollment ${id} as completed`,
      oldValues: before,
      newValues: item,
    });

    return item;
  }

  // ==============================================================
  // CLASS PROGRESS / TRANSITIONS
  // ==============================================================

  async getCohortProgress(classId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId, status: 'ACTIVE' },
      select: {
        userId: true,
        user: { select: { displayName: true, avatarUrl: true } },
      },
    });

    const totalLessons = await this.prisma.lesson.count({
      where: {
        module: {
          courseProfile: { classes: { some: { id: classId } } },
        },
      },
    });

    return Promise.all(
      enrollments.map(async (e) => {
        const completedLessons = await this.prisma.userLessonProgress.count({
          where: { userId: e.userId, classId, isCompleted: true },
        });

        return {
          userId: e.userId,
          displayName: e.user.displayName,
          avatarUrl: e.user.avatarUrl,
          completedLessons,
          totalLessons,
          progressPercent:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
        };
      }),
    );
  }

  async migrateStudents(
    sourceClassId: string,
    targetClassId: string,
    requesterId = 'SYSTEM',
  ) {
    const sourceClass = await this.prisma.class.findUnique({
      where: { id: sourceClassId },
      include: { _count: { select: { enrollments: true } } },
    });
    const targetClass = await this.prisma.class.findUnique({
      where: { id: targetClassId },
    });

    if (!sourceClass || !targetClass)
      throw new NotFoundException('Class not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId: sourceClassId, status: 'ACTIVE' },
    });

    return this.prisma.$transaction(async (tx) => {
      for (const e of enrollments) {
        await tx.enrollment.update({
          where: { id: e.id },
          data: { classId: targetClassId },
        });
      }

      await this.audit.log({
        userId: requesterId,
        action: 'enrollment.migrate',
        entity: 'Enrollment',
        entityId: targetClassId,
        description: `Migrated ${enrollments.length} students from ${sourceClass.code} to ${targetClass.code}`,
      });

      return { migratedCount: enrollments.length };
    });
  }

  async checkEligibility(
    userId: string,
    targetId: string,
    targetType: 'CLASS' | 'OFFERING' | 'COURSE',
  ) {
    const where =
      targetType === 'CLASS'
        ? { userId, classId: targetId }
        : targetType === 'COURSE'
          ? { userId, class: { courseProfileId: targetId } }
          : { userId, offeringId: targetId };

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        ...where,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
    });

    return {
      isEnrolled: !!enrollment,
      enrollmentStatus: enrollment?.status ?? null,
    };
  }
}
