import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) { }

  async findAll(query: EnrollmentQueryDto) {
    const enrollmentRecords = await this.prisma.enrollment.findMany({
      where: {
        classId: query.classId ?? undefined,
        userId: query.userId ?? undefined,
        status: query.status ?? undefined,
      },
      include: {
        class: {
          include: {
            vodClass: true,
            liveClass: {
              include: {
                primaryTeacher: {
                  select: {
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            courseProfile: {
              select: {
                title: true,
                code: true,
                thumbnailUrl: true,
              },
            },
            courseEdition: {
              select: {
                chapters: {
                  select: {
                    items: {
                      where: { kind: 'LESSON' },
                      select: { referenceId: true },
                    },
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
      // Logic for Learner Portal (rich mapping)
      return Promise.all(
        enrollmentRecords.map(async (e) => {
          const allLessonIds = e.class.courseEdition.chapters.flatMap((c) =>
            c.items.map((i) => i.referenceId),
          );
          const totalLessons = allLessonIds.length;

          let completedCount = 0;
          if (totalLessons > 0) {
            completedCount = await this.prisma.learningProgress.count({
              where: {
                userId: e.userId,
                classId: e.classId,
                status: 'COMPLETED',
                lessonId: { in: allLessonIds },
              },
            });
          }

          const primaryTeacher = e.class.liveClass?.primaryTeacher;

          return {
            id: e.id,
            status: e.status,
            enrolledAt: e.enrolledAt,
            expiresAt: e.expiresAt,
            courseId: e.class.courseProfileId,
            courseRunId: e.classId,
            courseTitle: e.class.courseProfile.title,
            slug: e.class.courseProfile.code,
            thumbnailUrl: e.class.courseProfile.thumbnailUrl,
            instructorName: primaryTeacher?.displayName ?? 'Academy Instructor',
            instructorAvatar: primaryTeacher?.avatarUrl,
            progress: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
            completedLessons: completedCount,
            totalLessons: totalLessons,
          };
        }),
      );
    }

    return enrollmentRecords;
  }

  async findById(id: string) {
    const item = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Enrollment not found');
    return item;
  }

  async create(input: EnrollmentCreateDto, requesterId = 'SYSTEM') {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      include: {
        vodClass: true,
        liveClass: true,
      },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    if (klass.status !== 'ENROLLING' && klass.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Can only enroll in ENROLLING or IN_PROGRESS classes');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    });
    if (!user) throw new BadRequestException('Invalid userId');

    const existing = await this.prisma.enrollment.findFirst({
      where: { classId: input.classId, userId: input.userId },
      select: { id: true },
    });
    if (existing) return this.findById(existing.id);

    const maxStudents = klass.mode === 'VOD' ? klass.vodClass?.maxStudents : klass.liveClass?.maxStudents;

    if (maxStudents) {
      const currentCount = await this.prisma.enrollment.count({
        where: { classId: input.classId, status: 'ACTIVE' },
      });
      if (currentCount >= maxStudents) {
        throw new BadRequestException('Class is full');
      }
    }

    const result = await this.prisma.enrollment.create({
      data: {
        classId: input.classId,
        userId: input.userId,
        expiresAt: input.expiresAt,
        status: input.status ?? 'ACTIVE',
        sourceOfferingId: input.sourceOfferingId,
        sourceOrderId: input.sourceOrderId,
        companyId: input.companyId,
        metadata: input.metadata ?? undefined,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'enrollment.create',
      entity: 'Enrollment',
      entityId: result.id,
      description: `Created enrollment for user ${input.userId} in class ${input.classId}`,
      metadata: { classId: input.classId },
    });

    return result;
  }

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
      description: `Updated enrollment ${id} status to ${status}`,
      oldValues: { status: old.status },
      newValues: { status },
    });

    return updated;
  }

  async moveEnrollment(id: string, targetClassId: string) {
    const enrollment = await this.findById(id);
    const targetClass = await this.prisma.class.findUnique({
      where: { id: targetClassId },
      select: { id: true, courseEditionId: true },
    });
    if (!targetClass) throw new BadRequestException('Target class not found');

    const sourceClass = await this.prisma.class.findUnique({
      where: { id: enrollment.classId },
      select: { id: true, courseEditionId: true },
    });

    if (sourceClass?.courseEditionId !== targetClass.courseEditionId) {
      throw new BadRequestException('Can only move enrollment between classes of the same edition');
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
      description: `Moved enrollment ${id} from class ${enrollment.classId} to ${targetClassId}`,
      oldValues: { classId: enrollment.classId },
      newValues: { classId: targetClassId },
    });

    return result;
  }

  async checkCompletion(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        class: {
          include: {
            courseEdition: {
              include: { chapters: { include: { items: true } } },
            },
          },
        },
        user: true,
      },
    });
    if (!enrollment || enrollment.status !== 'ACTIVE') return;

    // Simplified completion: check if all LESSON chapter items have learning progress COMPLETED
    const chapterItems = enrollment.class.courseEdition.chapters.flatMap((c) => c.items);
    const lessons = chapterItems.filter((i) => i.kind === 'LESSON');

    if (lessons.length === 0) return;

    const completedLessons = await this.prisma.learningProgress.count({
      where: {
        userId: enrollment.userId,
        classId: enrollment.classId,
        status: 'COMPLETED',
        lessonId: { in: lessons.map((l) => l.referenceId) },
      },
    });

    if (completedLessons >= lessons.length) {
      await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'COMPLETED' },
      });

      // Trigger achievement evaluation for course completion
      this.achievementService.evaluateForUser(enrollment.userId).catch(err =>
        console.error(`Failed to evaluate achievements for user ${enrollment.userId} after enrollment completion`, err)
      );
    }
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const enrollment = await this.findById(id);
    await this.prisma.enrollment.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'enrollment.delete',
      entity: 'Enrollment',
      entityId: id,
      description: `Deleted enrollment for user ${enrollment.userId} in class ${enrollment.classId}`,
      metadata: { userId: enrollment.userId, classId: enrollment.classId },
    });

    return { ok: true };
  }
}
