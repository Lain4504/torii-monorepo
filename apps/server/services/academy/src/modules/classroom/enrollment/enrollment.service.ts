import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { Prisma } from '@prisma/generated';
import { EnrollmentCreateDto, EnrollmentQueryDto } from './dto/enrollment.dto';
import { AuditLoggerService } from '../../audit-logger.service';
import { AchievementService } from '../../gamification/achievement.service';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
    private readonly achievementService: AchievementService,
  ) { }

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
              select: { id: true, title: true, code: true, thumbnailUrl: true },
            },
          },
        },
      },
      orderBy: [{ enrolledAt: 'desc' }],
    });

    // Learner portal: enrich with progress data
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
                  syllabus: { classes: { some: { id: classId } } },
                },
              },
            });

            completedLessons = await this.prisma.userLessonProgress.count({
              where: { userId: e.userId, classId, isCompleted: true },
            });

            progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
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
            instructorName: instructor?.displayName ?? null,
            instructorAvatar: instructor?.avatarUrl ?? null,
            progress: progressPercent,
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
        offering: { select: { id: true, mode: true, status: true } },
        class: { select: { id: true, mode: true, status: true } },
      },
    });
    if (!item) throw new NotFoundException('Enrollment not found');
    return item;
  }

  // ==============================================================
  // CREATE
  // ==============================================================

  /**
   * Create enrollment.
   * - Requires classId (The operational center).
   * - Optional offeringId (The purchase gate reference).
   * - For LIVE: classId must be OPENING/ONGOING.
   * - For VOD: classId must be PUBLISHED.
   */
  async create(
    input: EnrollmentCreateDto,
    requesterId = 'SYSTEM',
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx ?? this.prisma;

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    });
    if (!user) throw new BadRequestException('Invalid userId');

    // Every Enrollment must have a classId in V2 Class-Centric model
    if (!input.classId) throw new BadRequestException('classId is required for enrollment');

    const klass = await prisma.class.findUnique({
      where: { id: input.classId },
      select: {
        id: true,
        mode: true,
        status: true,
        courseProfileId: true,
        openingDate: true,
      },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    // LIVE class must be OPENING or ONGOING to accept enrollment
    if (klass.mode === 'LIVE' && !['OPENING', 'ONGOING'].includes(klass.status)) {
      throw new BadRequestException(
        `LIVE class is not open for enrollment (status: ${klass.status})`,
      );
    }

    // LIVE: at most one ACTIVE enrollment per user per courseProfile per term (same quarter of openingDate)
    if (klass.mode === 'LIVE' && klass.courseProfileId && klass.openingDate) {
      const openDate = new Date(klass.openingDate);
      const year = openDate.getFullYear();
      const month = openDate.getMonth();
      const termStart = new Date(year, Math.floor(month / 4) * 4, 1); // Q1: 0-3, Q2: 4-7, Q3: 8-11
      const termEnd = new Date(termStart);
      termEnd.setMonth(termEnd.getMonth() + 4);

      const existingSameTerm = await prisma.enrollment.findFirst({
        where: {
          userId: input.userId,
          status: { in: ['ACTIVE'] },
          class: {
            mode: 'LIVE',
            courseProfileId: klass.courseProfileId,
            openingDate: {
              gte: termStart,
              lt: termEnd,
            },
          },
        },
        select: { id: true },
      });
      if (existingSameTerm) {
        throw new BadRequestException(
          'Bạn đã đăng ký 1 lớp LIVE cho khoá này trong kỳ hiện tại',
        );
      }
    }
    // VOD class must be PUBLISHED to accept enrollment
    if (klass.mode === 'VOD' && klass.status !== 'PUBLISHED') {
      throw new BadRequestException(
        `VOD class is not open for enrollment (status: ${klass.status})`,
      );
    }

    // Validate offering if provided (the purchase gate)
    if (input.offeringId) {
      const offering = await prisma.courseOffering.findUnique({
        where: { id: input.offeringId },
        select: { id: true, mode: true, status: true },
      });
      if (!offering) throw new BadRequestException('Invalid offeringId');

      const allowedStatuses = ['PUBLISHED', 'OPENING'];
      if (!allowedStatuses.includes(offering.status)) {
        throw new BadRequestException(`Offering is not open for enrollment (status: ${offering.status})`);
      }

      if (offering.mode !== klass.mode) {
        throw new BadRequestException(
          `Offering mode (${offering.mode}) does not match class mode (${klass.mode})`,
        );
      }
    }

    // Check duplicate per class (Primary operational constraint)
    const existingByClass = await prisma.enrollment.findFirst({
      where: {
        userId: input.userId,
        classId: input.classId,
      },
      select: { id: true },
    });
    if (existingByClass) {
      return prisma.enrollment.findUnique({ where: { id: existingByClass.id } });
    }

    // Check duplicate per offering if provided (Commercial constraint)
    if (input.offeringId) {
      const existingByOffering = await prisma.enrollment.findFirst({
        where: {
          userId: input.userId,
          offeringId: input.offeringId,
        },
        select: { id: true },
      });
      if (existingByOffering) {
        return prisma.enrollment.findUnique({ where: { id: existingByOffering.id } });
      }
    }

    try {
      const result = await prisma.enrollment.create({
        data: {
          userId: input.userId,
          classId: input.classId,
          offeringId: input.offeringId ?? undefined,
          expiresAt: input.expiresAt,
          status: input.status ?? 'ACTIVE',
          sourceOrderId: input.sourceOrderId,
        },
      });

      await this.audit.log({
        userId: requesterId,
        action: 'enrollment.create',
        entity: 'Enrollment',
        entityId: result.id,
        description: `Enrolled user ${input.userId} into class ${input.classId} (offering: ${input.offeringId})`,
        metadata: { offeringId: input.offeringId, classId: input.classId },
      });

      return result;
    } catch (err: any) {
      // Race condition: unique constraint P2002
      if (err?.code === 'P2002') {
        const concurrent = await prisma.enrollment.findFirst({
          where: {
            userId: input.userId,
            classId: input.classId,
          },
        });
        if (concurrent) return concurrent;
      }
      throw err;
    }
  }

  // ==============================================================
  // STATUS & MANAGEMENT
  // ==============================================================

  async updateStatus(id: string, status: string, requesterId = 'SYSTEM') {
    const old = await this.findById(id);
    const updated = await this.prisma.enrollment.update({
      where: { id },
      data: { status },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'enrollment.update_status',
      entity: 'Enrollment',
      entityId: id,
      description: `Updated enrollment ${id} status: ${old.status} → ${status}`,
      oldValues: { status: old.status },
      newValues: { status },
    });

    return updated;
  }

  /**
   * Move a LIVE enrollment to a different class of the same course profile.
   * VOD enrollments don't need to move — they are tied to the offering/syllabus.
   */
  async moveEnrollment(id: string, targetClassId: string) {
    const enrollment = await this.findById(id);

    if (enrollment.class?.mode !== 'LIVE') {
      throw new BadRequestException('Only LIVE enrollments can be moved between classes');
    }

    const targetClass = await this.prisma.class.findUnique({
      where: { id: targetClassId },
      select: { id: true, courseProfileId: true, mode: true },
    });
    if (!targetClass) throw new BadRequestException('Target class not found');
    if (targetClass.mode !== 'LIVE') throw new BadRequestException('Target class must also be LIVE');

    const sourceClass = await this.prisma.class.findUnique({
      where: { id: enrollment.classId! },
      select: { courseProfileId: true },
    });
    if (sourceClass?.courseProfileId !== targetClass.courseProfileId) {
      throw new BadRequestException('Target class must belong to the same course profile');
    }

    const result = await this.prisma.enrollment.update({
      where: { id },
      data: { classId: targetClassId },
    });

    await this.audit.log({
      userId: 'SYSTEM',
      action: 'enrollment.move',
      entity: 'Enrollment',
      entityId: id,
      description: `Moved enrollment ${id}: class ${enrollment.classId} → ${targetClassId}`,
      oldValues: { classId: enrollment.classId },
      newValues: { classId: targetClassId },
    });

    return result;
  }

  /**
   * Check if all lessons in the class are completed → mark enrollment COMPLETED.
   * Triggers achievement evaluation.
   */
  async checkCompletion(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: { select: { id: true, syllabusId: true } },
        user: { select: { id: true } },
      },
    });
    if (!enrollment || enrollment.status !== 'ACTIVE' || !enrollment.classId) return;

    const totalLessons = await this.prisma.lesson.count({
      where: {
        module: {
          syllabus: { classes: { some: { id: enrollment.classId } } },
        },
      },
    });
    if (totalLessons === 0) return;

    const completedLessons = await this.prisma.userLessonProgress.count({
      where: {
        userId: enrollment.userId,
        classId: enrollment.classId,
        isCompleted: true,
      },
    });

    if (completedLessons >= totalLessons) {
      await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'COMPLETED' },
      });

      this.achievementService.evaluateForUser(enrollment.userId).catch((err) =>
        console.error(`Failed to evaluate achievements for user ${enrollment.userId}`, err),
      );
    }
  }

  // ==============================================================
  // DELETE
  // ==============================================================

  async delete(id: string, requesterId = 'SYSTEM') {
    const enrollment = await this.findById(id);

    if (!['CANCELLED', 'EXPIRED'].includes(enrollment.status)) {
      throw new BadRequestException('Cannot delete active enrollment. Cancel it first.');
    }

    await this.prisma.enrollment.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'enrollment.delete',
      entity: 'Enrollment',
      entityId: id,
      description: `Deleted enrollment ${id} for user ${enrollment.userId}`,
    });

    return { ok: true };
  }

  async getLearnerStats(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        class: true,
      },
    });

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e) => e.status === 'COMPLETED').length;
    const inProgressCourses = enrollments.filter((e) => e.status === 'ACTIVE').length;

    // Calculate actual average progress
    let totalProgress = 0;
    for (const e of enrollments) {
      if (e.status === 'COMPLETED') {
        totalProgress += 100;
        continue;
      }
      if (e.classId) {
        const totalLessons = await this.prisma.lesson.count({
          where: {
            module: {
              syllabus: { classes: { some: { id: e.classId } } },
            },
          },
        });
        const completedLessons = await this.prisma.userLessonProgress.count({
          where: { userId: e.userId, classId: e.classId, isCompleted: true },
        });
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        totalProgress += progress;
      }
    }

    const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalLearningHours: completedCourses * 2 + inProgressCourses, // Heuristic mock for now
      averageProgress,
    };
  }

  async checkEnrollment(userId: string, classId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        classId,
        status: 'ACTIVE',
      },
      include: {
        class: { select: { name: true, mode: true, status: true } },
      },
    });

    if (!enrollment) {
      return { isEnrolled: false, enrollment: null };
    }

    // Calculate progress
    const totalLessons = await this.prisma.lesson.count({
      where: {
        module: {
          syllabus: { classes: { some: { id: classId } } },
        },
      },
    });
    const completedLessons = await this.prisma.userLessonProgress.count({
      where: { userId, classId, isCompleted: true },
    });
    const completionPercentage =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      isEnrolled: true,
      enrollment: {
        ...enrollment,
        enrollmentDate: enrollment.enrolledAt,
        completionPercentage,
      },
    };
  }
}
