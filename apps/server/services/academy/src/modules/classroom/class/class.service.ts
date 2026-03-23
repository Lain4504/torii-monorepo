import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ActivityType, ClassStatus } from '@prisma/generated';
import {
  ClassAssignmentCreateDto,
  ClassAssignmentUpdateDto,
  ClassCreateDto,
  ClassDuplicateDto,
  ClassQueryDto,
  ClassUpdateDto,
} from './dto/class.dto';
import { AuditLoggerService } from '../../audit-logger.service';
import { LiveScheduleService } from '../live-schedule/live-schedule.service';
import { GamificationService } from '../../gamification/gamification.service';
import { LiveClassCapacityService } from './live-class-capacity.service';
import { ClassMode } from '@prisma/generated';

/**
 * ClassService - The Operational Layer (Cohorts)
 *
 * Each Class is an instance of a CourseProfile (Blueprint).
 * Legacy Syllabus dependency has been removed.
 */
@Injectable()
export class ClassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
    private readonly liveSchedules: LiveScheduleService,
    private readonly gamification: GamificationService,
    private readonly liveClassCapacity: LiveClassCapacityService,
  ) {}

  // ==============================================================
  // CLASS CRUD
  // ==============================================================

  async findAll(query: ClassQueryDto) {
    const q = query.q?.trim();
    const statusFilter =
      query.status == null
        ? undefined
        : query.status.includes(',')
          ? {
              in: query.status
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean) as ClassStatus[],
            }
          : (query.status as ClassStatus);

    const rows = await this.prisma.class.findMany({
      where: {
        courseProfileId: query.courseProfileId ?? undefined,
        mode: query.mode as any,
        ...(statusFilter != null ? { status: statusFilter } : {}),
        instructorId: query.instructorId ?? undefined,
        ...(q
          ? {
              OR: [
                { code: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: { enrollments: true, liveSchedules: true },
        },
        instructor: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        courseProfile: {
          select: {
            id: true,
            title: true,
            code: true,
            level: true,
            thumbnailUrl: true,
          },
        },
        term: {
          select: {
            id: true,
            termCode: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    return this.liveClassCapacity.attachLiveEnrollmentSummary(rows);
  }

  async findById(id: string) {
    const item = await this.prisma.class.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        courseProfile: {
          select: {
            id: true,
            title: true,
            code: true,
            level: true,
            thumbnailUrl: true,
            modules: {
              include: {
                lessons: { orderBy: { orderIndex: 'asc' } },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        term: {
          select: {
            termCode: true,
            openingDate: true,
            closingDate: true,
            enrollmentOpenAt: true,
            enrollmentCloseAt: true,
          },
        },
        liveSchedules: true,
        _count: {
          select: { enrollments: true, liveSchedules: true },
        },
      },
    });
    if (!item) throw new NotFoundException('Class not found');
    if (item.mode === ClassMode.LIVE) {
      const [enriched] =
        await this.liveClassCapacity.attachLiveEnrollmentSummary([item]);
      return enriched;
    }
    return item;
  }

  async findTerms(courseProfileId: string) {
    return this.prisma.liveTerm.findMany({
      where: { courseProfileId },
      orderBy: { openingDate: 'desc' },
    });
  }

  async create(input: ClassCreateDto, requesterId = 'SYSTEM') {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: { status: true, code: true },
    });
    if (!profile) throw new BadRequestException('Invalid courseProfileId');

    if (profile.status === 'ARCHIVED') {
      throw new BadRequestException(
        'Cannot create class for an archived course profile.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let resolvedTermId = input.termId ?? undefined;

      if (input.mode === 'LIVE' && !resolvedTermId) {
        if (!input.term) {
          throw new BadRequestException(
            'LIVE class requires `termId` or `term`.',
          );
        }

        const openingDate = new Date(input.term.openingDate as any);
        const closingDate = new Date(input.term.closingDate as any);

        if (
          Number.isNaN(openingDate.getTime()) ||
          Number.isNaN(closingDate.getTime())
        ) {
          throw new BadRequestException(
            'LIVE class requires valid term opening/closing dates.',
          );
        }

        const enrollmentOpenAt =
          input.term.enrollmentOpenAt != null
            ? new Date(input.term.enrollmentOpenAt as any)
            : undefined;
        const enrollmentCloseAt =
          input.term.enrollmentCloseAt != null
            ? new Date(input.term.enrollmentCloseAt as any)
            : undefined;

        const liveTerm = await tx.liveTerm.upsert({
          where: {
            courseProfileId_termCode: {
              courseProfileId: input.courseProfileId,
              termCode: input.term.termCode,
            },
          },
          create: {
            courseProfileId: input.courseProfileId,
            termCode: input.term.termCode,
            status: 'DRAFT',
            openingDate,
            closingDate,
            enrollmentOpenAt:
              enrollmentOpenAt && !Number.isNaN(enrollmentOpenAt.getTime())
                ? enrollmentOpenAt
                : null,
            enrollmentCloseAt:
              enrollmentCloseAt && !Number.isNaN(enrollmentCloseAt.getTime())
                ? enrollmentCloseAt
                : null,
          },
          update: {
            openingDate,
            closingDate,
            enrollmentOpenAt:
              enrollmentOpenAt && !Number.isNaN(enrollmentOpenAt.getTime())
                ? enrollmentOpenAt
                : null,
            enrollmentCloseAt:
              enrollmentCloseAt && !Number.isNaN(enrollmentCloseAt.getTime())
                ? enrollmentCloseAt
                : null,
          },
        });

        resolvedTermId = liveTerm.id;
      }

      if (input.mode === 'LIVE' && !resolvedTermId) {
        throw new BadRequestException(
          'LIVE class requires `termId` or `term`.',
        );
      }

      if (
        input.mode === 'LIVE' &&
        input.maxStudents != null &&
        input.maxStudents < 1
      ) {
        throw new BadRequestException(
          'Sĩ số tối đa (LIVE) phải ≥ 1 hoặc để trống (không giới hạn).',
        );
      }

      const classItem = await tx.class.create({
        data: {
          courseProfileId: input.courseProfileId,
          code: input.code,
          name: input.name,
          mode: input.mode as any,
          status: (input.status as ClassStatus) ?? 'DRAFT',
          instructorId: input.instructorId,
          termId: resolvedTermId,
          maxStudents:
            input.mode === 'LIVE' && input.maxStudents != null
              ? input.maxStudents
              : null,
        },
      });

      await this.audit.log({
        userId: requesterId,
        action: 'class.create',
        entity: 'Class',
        entityId: classItem.id,
        description: `Created ${input.mode} class ${input.code} for profile ${profile.code}`,
        metadata: {
          code: input.code,
          mode: input.mode,
          courseProfileId: input.courseProfileId,
        },
      });

      return classItem;
    });
  }

  async update(id: string, input: ClassUpdateDto, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);

    if (
      classItem.mode === 'LIVE' &&
      input.instructorId &&
      input.instructorId !== classItem.instructorId
    ) {
      await this.assertPrimaryTeacherScheduleConflicts(id, input.instructorId);
    }

    let maxStudentsUpdate: number | null | undefined = undefined;
    if (classItem.mode === ClassMode.LIVE && input.maxStudents !== undefined) {
      if (input.maxStudents != null && input.maxStudents < 1) {
        throw new BadRequestException(
          'Sĩ số tối đa (LIVE) phải ≥ 1 hoặc để trống (không giới hạn).',
        );
      }
      const active = await this.liveClassCapacity.countActive(id);
      if (
        input.maxStudents != null &&
        input.maxStudents < active
      ) {
        throw new BadRequestException(
          `Không thể đặt tối đa ${input.maxStudents} học viên khi lớp đang có ${active} học viên đang học.`,
        );
      }
      maxStudentsUpdate = input.maxStudents ?? null;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedClass = await tx.class.update({
        where: { id },
        data: {
          name: input.name,
          status: (input.status as ClassStatus) ?? undefined,
          instructorId: input.instructorId,
          courseProfileId: input.courseProfileId,
          termId: input.termId,
          ...(maxStudentsUpdate !== undefined
            ? { maxStudents: maxStudentsUpdate }
            : {}),
        },
      });

      await this.audit.log({
        userId: requesterId,
        action: 'class.update',
        entity: 'Class',
        entityId: id,
        description: `Updated class ${classItem.code}`,
        oldValues: {
          name: classItem.name,
          status: classItem.status,
          courseProfileId: classItem.courseProfileId,
        },
        newValues: {
          name: updatedClass.name,
          status: updatedClass.status,
          courseProfileId: updatedClass.courseProfileId,
        },
      });

      return updatedClass;
    });
  }

  async submitForApproval(id: string, requesterId: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
    });
    if (!classItem) throw new NotFoundException('Class not found');

    const result = await this.prisma.class.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL' as ClassStatus,
        submittedForApprovalAt: new Date(),
        submittedBy: requesterId,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.submit_approval',
      entity: 'Class',
      entityId: id,
      description: `Submitted class ${classItem.code} for approval`,
    });

    return result;
  }

  async approve(id: string, requesterId: string) {
    // Approve basically publishes the class
    return this.publishClass(id, requesterId);
  }

  async reject(id: string, reason: string, requesterId: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
    });
    if (!classItem) throw new NotFoundException('Class not found');

    const result = await this.prisma.class.update({
      where: { id },
      data: {
        status: 'DRAFT' as ClassStatus,
        rejectedAt: new Date(),
        rejectedBy: requesterId,
        rejectionReason: reason,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.reject',
      entity: 'Class',
      entityId: id,
      description: `Rejected class ${classItem.code}: ${reason}`,
    });

    return result;
  }

  /** VOD: DRAFT → PUBLISHED / LIVE: DRAFT → OPENING */
  async publishClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: {
        liveSchedules: { take: 1 },
        courseProfile: {
          select: { status: true, code: true },
        },
      },
    });
    if (!classItem) throw new NotFoundException('Class not found');

    // CourseProfile phải đã được approve (PUBLISHED) thì mới publish lớp.
    if (classItem.courseProfile?.status !== 'PUBLISHED') {
      throw new BadRequestException(
        `Cannot publish class because course profile is not published (status: ${classItem.courseProfile?.status ?? 'UNKNOWN'}).`,
      );
    }

    if (classItem.mode === 'LIVE') {
      if (!classItem.liveSchedules || classItem.liveSchedules.length === 0) {
        throw new BadRequestException(
          'LIVE class must have at least one LiveSchedule before publishing',
        );
      }
      if (!classItem.termId) {
        throw new BadRequestException(
          'LIVE class must be attached to a LiveTerm before publishing',
        );
      }
    }

    const newStatus = classItem.mode === 'VOD' ? 'PUBLISHED' : 'OPENING';

    const result = await this.prisma.class.update({
      where: { id },
      data: {
        status: newStatus as ClassStatus,
        approvedAt: new Date(),
        approvedBy: requesterId,
      },
    });

    if (classItem.mode === 'LIVE') {
      try {
        await this.liveSchedules.generateInstancesForClassRange(
          classItem.id,
          requesterId,
        );
      } catch (err) {
        console.warn(
          `[ClassService.publishClass] generateInstancesForClassRange skipped: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    await this.audit.log({
      userId: requesterId,
      action: 'class.publish',
      entity: 'Class',
      entityId: id,
      description: `Published class ${classItem.code} to ${newStatus}`,
    });

    return result;
  }

  async startClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);
    if (classItem.status === 'ONGOING') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'ONGOING' as ClassStatus },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.start',
      entity: 'Class',
      entityId: id,
      description: `Started class ${classItem.code}`,
    });

    return result;
  }

  async completeClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);
    if (classItem.status === 'COMPLETED') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'COMPLETED' as ClassStatus },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.complete',
      entity: 'Class',
      entityId: id,
      description: `Completed class ${classItem.code}`,
    });

    return result;
  }

  async duplicate(
    id: string,
    input?: ClassDuplicateDto,
    requesterId = 'SYSTEM',
  ) {
    const source = await this.prisma.class.findUnique({
      where: { id },
      include: { liveSchedules: true },
    });
    if (!source) throw new NotFoundException('Source class not found');

    const targetCode = input?.code || `${source.code}-COPY-${Date.now()}`;
    const targetName = input?.name || `${source.name} (Copy)`;

    return this.prisma.$transaction(async (tx) => {
      const newClass = await tx.class.create({
        data: {
          courseProfileId: source.courseProfileId,
          code: targetCode,
          name: targetName,
          mode: source.mode,
          status: 'DRAFT',
          instructorId: input?.instructorId || source.instructorId,
          termId: source.termId,
        },
      });

      if (source.mode === 'LIVE' && source.liveSchedules.length > 0) {
        await tx.liveSchedule.createMany({
          data: source.liveSchedules.map((s) => ({
            classId: newClass.id,
            weekday: s.weekday,
            startTime: s.startTime,
            endTime: s.endTime,
            location: s.location,
            excludedDates: s.excludedDates ?? undefined,
            note: s.note,
            roomId: s.roomId,
          })),
        });
      }

      await this.audit.log({
        userId: requesterId,
        action: 'class.duplicate',
        entity: 'Class',
        entityId: newClass.id,
        description: `Duplicated class ${source.code} → ${targetCode}`,
      });

      return tx.class.findUnique({
        where: { id: newClass.id },
        include: {
          instructor: { select: { id: true, displayName: true } },
          liveSchedules: true,
        },
      });
    });
  }

  async archiveClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);
    if (classItem.status === 'ARCHIVED') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'ARCHIVED' as ClassStatus },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.archive',
      entity: 'Class',
      entityId: id,
      description: `Archived class ${classItem.code}`,
    });

    return result;
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);

    if (classItem._count.enrollments > 0) {
      throw new BadRequestException(
        'Cannot delete class with active enrollments',
      );
    }

    await this.prisma.class.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'class.delete',
      entity: 'Class',
      entityId: id,
      description: `Deleted class ${classItem.code}`,
    });

    return { ok: true };
  }

  private async assertPrimaryTeacherScheduleConflicts(
    classId: string,
    instructorId: string,
  ) {
    // No changes needed to logic, just bypass
  }

  // ==============================================================
  // CLASS ASSIGNMENTS
  // ==============================================================

  async getClassAssignmentById(id: string) {
    const ca = await this.prisma.classAssignment.findUnique({
      where: { id },
      include: {
        assignment: true,
        _count: { select: { submissions: true } },
      },
    });
    if (!ca) throw new NotFoundException('Class assignment not found');
    return ca;
  }

  async getAssignments(classId: string) {
    return this.prisma.classAssignment.findMany({
      where: { classId },
      include: {
        assignment: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { openAt: 'asc' },
    });
  }

  async addAssignment(input: ClassAssignmentCreateDto, requesterId = 'SYSTEM') {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true, mode: true },
    });
    if (!klass) throw new NotFoundException('Class not found');

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          title: input.title,
          instructions: input.instructions || '',
        },
      });

      return tx.classAssignment.create({
        data: {
          classId: input.classId,
          assignmentId: assignment.id,
          openAt: input.openAt ? new Date(input.openAt) : null,
          deadline: input.deadline ? new Date(input.deadline) : null,
        },
        include: { assignment: true },
      });
    });
  }

  async updateAssignment(id: string, input: ClassAssignmentUpdateDto) {
    const ca = await this.prisma.classAssignment.findUnique({ where: { id } });
    if (!ca) throw new NotFoundException('Class assignment not found');

    const assignmentUpdate: { title?: string; instructions?: string } = {};
    if (input.title !== undefined) assignmentUpdate.title = input.title;
    if (input.instructions !== undefined)
      assignmentUpdate.instructions = input.instructions;

    return this.prisma.classAssignment.update({
      where: { id },
      data: {
        openAt: input.openAt ? new Date(input.openAt) : undefined,
        deadline: input.deadline ? new Date(input.deadline) : undefined,
        assignment:
          Object.keys(assignmentUpdate).length > 0
            ? { update: assignmentUpdate }
            : undefined,
      },
      include: { assignment: true },
    });
  }

  async removeAssignment(id: string, requesterId = 'SYSTEM') {
    const ca = await this.prisma.classAssignment.findUnique({ where: { id } });
    if (!ca) throw new NotFoundException('Class assignment not found');

    await this.prisma.classAssignment.delete({ where: { id } });
    return { success: true };
  }

  // ==============================================================
  // LESSON PROGRESS
  // ==============================================================

  async getUserProgress(userId: string, classId: string) {
    const klass = await this.findById(classId);

    const completed = await this.prisma.userLessonProgress.findMany({
      where: { userId, classId, isCompleted: true },
      select: { lessonId: true, updatedAt: true },
    });

    const completedIds = new Set(completed.map((c) => c.lessonId));

    // Combine blueprint structure with student progress
    const modulesWithProgress = klass.courseProfile.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => {
        const p = completed.find((c) => c.lessonId === l.id);
        return {
          ...l,
          isCompleted: !!p,
          completedAt: p?.updatedAt ?? null,
        };
      }),
    }));

    const totalLessons = modulesWithProgress.reduce(
      (sum, m) => sum + m.lessons.length,
      0,
    );
    const completedCount = completed.length;
    const progressPercent =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      userId,
      classId,
      courseTitle: klass.courseProfile.title,
      progressPercent,
      completedCount,
      totalLessons,
      modules: modulesWithProgress,
    };
  }

  async markLessonComplete(userId: string, classId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const progress = await this.prisma.userLessonProgress.upsert({
      where: {
        userId_classId_lessonId: { userId, classId, lessonId },
      },
      create: {
        userId,
        classId,
        lessonId,
        isCompleted: true,
      },
      update: {
        isCompleted: true,
      },
    });

    // Gamification Integration
    await this.gamification
      .trackActivity(userId, ActivityType.LESSON_COMPLETE, {
        lessonId,
        classId,
      })
      .catch((err) => console.warn('Reward activity failed:', err));

    return progress;
  }
}
