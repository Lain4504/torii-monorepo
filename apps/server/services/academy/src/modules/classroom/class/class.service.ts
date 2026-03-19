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

@Injectable()
export class ClassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
    private readonly liveSchedules: LiveScheduleService,
    private readonly gamification: GamificationService,
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
    return this.prisma.class.findMany({
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
          select: { enrollments: true },
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
        syllabus: {
          select: {
            id: true,
            versionLabel: true,
            status: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
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
          },
        },
        syllabus: {
          select: {
            id: true,
            versionLabel: true,
            status: true,
            modules: {
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        liveSchedules: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });
    if (!item) throw new NotFoundException('Class not found');
    return item;
  }

  async create(input: ClassCreateDto, requesterId = 'SYSTEM') {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: { id: true },
    });
    if (!profile) throw new BadRequestException('Invalid courseProfileId');

    if (input.syllabusId) {
      const syllabus = await this.prisma.syllabus.findUnique({
        where: { id: input.syllabusId },
        select: { id: true },
      });
      if (!syllabus) throw new BadRequestException('Invalid syllabusId');
    }

    return this.prisma.$transaction(async (tx) => {
      const classItem = await tx.class.create({
        data: {
          courseProfileId: input.courseProfileId,
          syllabusId: input.syllabusId ?? undefined,
          code: input.code,
          name: input.name,
          mode: input.mode as any,
          status: (input.status as ClassStatus) ?? 'DRAFT',
          instructorId: input.instructorId,
          openingDate: input.openingDate
            ? new Date(input.openingDate)
            : undefined,
          closingDate: input.closingDate
            ? new Date(input.closingDate)
            : undefined,
          enrollmentOpenAt: input.enrollmentOpenAt
            ? new Date(input.enrollmentOpenAt)
            : undefined,
          enrollmentCloseAt: input.enrollmentCloseAt
            ? new Date(input.enrollmentCloseAt)
            : undefined,
        },
      });

      // Lock the syllabus when it is linked
      if (input.syllabusId) {
        await tx.syllabus.update({
          where: { id: input.syllabusId },
          data: { status: 'LOCKED' },
        });
      }

      await this.audit.log({
        userId: requesterId,
        action: 'class.create',
        entity: 'Class',
        entityId: classItem.id,
        description: `Created ${input.mode} class ${input.code}`,
        metadata: {
          code: input.code,
          mode: input.mode,
          syllabusId: input.syllabusId,
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

    return this.prisma.$transaction(async (tx) => {
      const updatedClass = await tx.class.update({
        where: { id },
        data: {
          name: input.name,
          status: input.status as ClassStatus,
          instructorId: input.instructorId,
          syllabusId: input.syllabusId,
          openingDate: input.openingDate
            ? new Date(input.openingDate)
            : undefined,
          closingDate: input.closingDate
            ? new Date(input.closingDate)
            : undefined,
          enrollmentOpenAt: input.enrollmentOpenAt
            ? new Date(input.enrollmentOpenAt)
            : undefined,
          enrollmentCloseAt: input.enrollmentCloseAt
            ? new Date(input.enrollmentCloseAt)
            : undefined,
        },
      });

      // Lock the new syllabus if updated
      if (input.syllabusId && input.syllabusId !== classItem.syllabusId) {
        await tx.syllabus.update({
          where: { id: input.syllabusId },
          data: { status: 'LOCKED' },
        });
      }

      await this.audit.log({
        userId: requesterId,
        action: 'class.update',
        entity: 'Class',
        entityId: id,
        description: `Updated class ${classItem.code}`,
        oldValues: {
          name: classItem.name,
          status: classItem.status,
          syllabusId: classItem.syllabusId,
        },
        newValues: {
          name: updatedClass.name,
          status: updatedClass.status,
          syllabusId: updatedClass.syllabusId,
        },
      });

      return updatedClass;
    });
  }

  // ==============================================================
  // STATUS TRANSITIONS (Status-based, no date logic)
  // ==============================================================

  /** VOD: DRAFT → PUBLISHED / LIVE: DRAFT → OPENING */
  async publishClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: { liveSchedules: { take: 1 } },
    });
    if (!classItem) throw new NotFoundException('Class not found');

    if (classItem.mode === 'LIVE') {
      if (!classItem.syllabusId) {
        throw new BadRequestException(
          'LIVE class must have a Syllabus before publishing',
        );
      }
      if (!classItem.liveSchedules || classItem.liveSchedules.length === 0) {
        throw new BadRequestException(
          'LIVE class must have at least one LiveSchedule',
        );
      }
      if (!classItem.openingDate || !classItem.closingDate) {
        throw new BadRequestException(
          'LIVE class must have openingDate and closingDate before publishing',
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

    // LIVE: generate "full" sessions when class becomes public.
    if (classItem.mode === 'LIVE') {
      try {
        const from = new Date(classItem.openingDate!);
        from.setUTCHours(0, 0, 0, 0);
        const to = new Date(classItem.closingDate!);
        to.setUTCHours(0, 0, 0, 0);
        await this.liveSchedules.generateInstancesForClassRange(
          classItem.id,
          requesterId,
        );
      } catch (err) {
        // Do not block publish if generation fails; can be regenerated via API on demand.

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
      description: `Approved class ${classItem.code} → ${newStatus}`,
    });

    return result;
  }

  async submitForApproval(id: string, requesterId: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: { liveSchedules: { take: 1 } },
    });
    if (!classItem) throw new NotFoundException('Class not found');
    if (classItem.status !== 'DRAFT') {
      throw new BadRequestException(
        'Only DRAFT classes can be submitted for approval',
      );
    }

    if (classItem.mode === 'LIVE') {
      if (!classItem.liveSchedules || classItem.liveSchedules.length === 0) {
        throw new BadRequestException(
          'LIVE class must have a LiveSchedule before submitting',
        );
      }
    }

    const updated = await this.prisma.class.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL' as ClassStatus,
        submittedForApprovalAt: new Date(),
        submittedBy: requesterId,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.submit',
      entity: 'Class',
      entityId: id,
      description: `Submitted class ${classItem.code} for approval`,
    });

    return updated;
  }

  async approve(id: string, requesterId: string) {
    return this.publishClass(id, requesterId);
  }

  async reject(id: string, reason: string, requesterId: string) {
    const classItem = await this.findById(id);
    if (classItem.status !== ('PENDING_APPROVAL' as ClassStatus)) {
      throw new BadRequestException(
        'Only PENDING_APPROVAL classes can be rejected',
      );
    }

    const updated = await this.prisma.class.update({
      where: { id },
      data: {
        status: 'DRAFT',
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
      metadata: { reason },
    });

    return updated;
  }

  /** LIVE: OPENING → ONGOING */
  async startClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);
    if (classItem.mode !== 'LIVE')
      throw new BadRequestException('Only LIVE classes can be started');
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
      oldValues: { status: classItem.status },
      newValues: { status: 'ONGOING' },
    });

    return result;
  }

  /** LIVE: ONGOING → COMPLETED */
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

  /** VOD/LIVE: any → ARCHIVED */
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
    if (classItem.status !== 'DRAFT' && classItem.status !== 'ARCHIVED') {
      throw new BadRequestException(
        'Can only delete DRAFT or ARCHIVED classes',
      );
    }

    const enrollCount = await this.prisma.enrollment.count({
      where: { classId: id },
    });
    if (enrollCount > 0) {
      throw new BadRequestException(
        'Cannot delete class with existing enrollments',
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

  /** Duplicate a class (copies liveSchedules, resets status to DRAFT) */
  async duplicate(
    id: string,
    input?: ClassDuplicateDto,
    requesterId = 'SYSTEM',
  ) {
    const source = await this.prisma.class.findUnique({
      where: { id },
      include: { liveSchedules: true },
    });
    if (!source) throw new NotFoundException('Class not found');

    let targetCode = input?.code || `${source.code}_COPY_${Date.now()}`;
    const existing = await this.prisma.class.findUnique({
      where: { code: targetCode },
    });
    if (existing)
      targetCode = `${targetCode}_${Math.floor(Math.random() * 1000)}`;

    const targetName = input?.name || `${source.name} (Bản sao)`;

    return this.prisma.$transaction(async (tx) => {
      const newClass = await tx.class.create({
        data: {
          courseProfileId: source.courseProfileId,
          syllabusId: source.syllabusId,
          code: targetCode,
          name: targetName,
          mode: source.mode,
          status: 'DRAFT',
          instructorId: input?.instructorId || source.instructorId,
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
        metadata: { sourceId: id, targetCode },
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

  // ==============================================================
  // CLASS ASSIGNMENTS (LIVE classes only)
  // ==============================================================

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
    if (klass.mode !== 'LIVE') {
      throw new BadRequestException('Assignments only apply to LIVE classes');
    }

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          title: input.title,
          instructions: input.instructions,
        },
      });

      const result = await tx.classAssignment.create({
        data: {
          classId: input.classId,
          assignmentId: assignment.id,
          titleOverride: input.titleOverride ?? null,
          openAt: input.openAt ?? null,
          deadline: input.deadline ?? null,
        },
        include: { assignment: true },
      });

      await this.audit.log({
        userId: requesterId,
        action: 'class_assignment.create',
        entity: 'ClassAssignment',
        entityId: result.id,
        description: `Created assignment for class ${input.classId}`,
      });

      return result;
    });
  }

  async updateAssignment(id: string, input: ClassAssignmentUpdateDto) {
    const item = await this.prisma.classAssignment.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('ClassAssignment not found');

    return this.prisma.classAssignment.update({
      where: { id },
      data: {
        titleOverride: input.titleOverride,
        openAt: input.openAt,
        deadline: input.deadline,
      },
      include: { assignment: true },
    });
  }

  async removeAssignment(id: string, requesterId = 'SYSTEM') {
    const item = await this.prisma.classAssignment.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('ClassAssignment not found');

    await this.prisma.classAssignment.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'class_assignment.delete',
      entity: 'ClassAssignment',
      entityId: id,
      description: `Removed ClassAssignment ${id} from class ${item.classId}`,
    });

    return { ok: true };
  }

  // ==============================================================
  // USER LESSON PROGRESS
  // ==============================================================

  /** Get progress for a specific user in a class */
  async getUserProgress(userId: string, classId: string) {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, syllabusId: true },
    });
    if (!klass) throw new NotFoundException('Class not found');
    if (!klass.syllabusId) {
      return {
        classId,
        userId,
        totalLessons: 0,
        completedLessons: 0,
        progressPercent: 0,
        lessons: [],
      };
    }

    const allLessons = await this.prisma.lesson.findMany({
      where: {
        module: {
          syllabusId: klass.syllabusId,
        },
      },
      select: { id: true },
    });

    const completedProgress = await this.prisma.userLessonProgress.findMany({
      where: { userId, classId, isCompleted: true },
      select: { lessonId: true, lastWatchedAt: true },
    });

    const completedIds = new Set(completedProgress.map((p) => p.lessonId));

    return {
      classId,
      userId,
      totalLessons: allLessons.length,
      completedLessons: completedIds.size,
      progressPercent:
        allLessons.length > 0
          ? Math.round((completedIds.size / allLessons.length) * 100)
          : 0,
      lessons: allLessons.map((l) => ({
        lessonId: l.id,
        isCompleted: completedIds.has(l.id),
      })),
    };
  }

  /** Mark a single lesson as complete */
  async markLessonComplete(userId: string, classId: string, lessonId: string) {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, syllabusId: true },
    });
    if (!klass) throw new NotFoundException('Class not found');
    if (!klass.syllabusId) {
      throw new BadRequestException('Class has no syllabus');
    }

    // Validate lesson belongs to this class's syllabus (prevent dirty progress writes)
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: { syllabusId: klass.syllabusId },
      },
      select: { id: true },
    });
    if (!lesson) {
      throw new BadRequestException('Lesson does not belong to class syllabus');
    }

    const progress = await this.prisma.userLessonProgress.upsert({
      where: { userId_classId_lessonId: { userId, classId, lessonId } },
      create: {
        userId,
        classId,
        lessonId,
        isCompleted: true,
        lastWatchedAt: new Date(),
      },
      update: {
        isCompleted: true,
        lastWatchedAt: new Date(),
      },
    });

    // Trigger gamification for lesson completion (XP/points & level/streak/achievements)
    this.gamification
      .trackActivity(userId, ActivityType.LESSON_COMPLETE, {
        lessonId,
        classId,
      })
      .catch(() => {
        // Gamification failure should not break core learning flow
      });

    // Close the loop: mark enrollment COMPLETED when all lessons done
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, classId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (enrollment?.id) {
      const [totalLessons, completedLessons] = await Promise.all([
        this.prisma.lesson.count({
          where: { module: { syllabusId: klass.syllabusId } },
        }),
        this.prisma.userLessonProgress.count({
          where: { userId, classId, isCompleted: true },
        }),
      ]);

      if (totalLessons > 0 && completedLessons >= totalLessons) {
        this.prisma.enrollment
          .update({
            where: { id: enrollment.id },
            data: { status: 'COMPLETED' },
          })
          .catch(() => {
            // Non-critical
          });
      }
    }

    return progress;
  }

  // ==============================================================
  // PRIVATE HELPERS
  // ==============================================================

  private async assertPrimaryTeacherScheduleConflicts(
    classId: string,
    instructorId: string,
  ) {
    const ownSchedules = await this.prisma.liveSchedule.findMany({
      where: { classId },
      select: { weekday: true, startTime: true, endTime: true },
    });
    if (ownSchedules.length === 0) return;

    const candidateSchedules = await this.prisma.liveSchedule.findMany({
      where: {
        classId: { not: classId },
        class: {
          instructorId,
          status: {
            in: [
              'DRAFT',
              'PENDING_APPROVAL',
              'OPENING',
              'ONGOING',
            ] as ClassStatus[],
          },
        },
      },
      include: { class: { select: { code: true, name: true } } },
    });

    for (const ownSlot of ownSchedules) {
      for (const candidate of candidateSchedules) {
        if (candidate.weekday !== ownSlot.weekday) continue;
        if (
          this.isTimeOverlap(
            ownSlot.startTime,
            ownSlot.endTime,
            candidate.startTime,
            candidate.endTime,
          )
        ) {
          throw new BadRequestException(
            `Teacher schedule conflict with class ${candidate.class.code} (${candidate.class.name})`,
          );
        }
      }
    }
  }

  private isTimeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ) {
    const aStart = this.toMinutes(startA);
    const aEnd = this.toMinutes(endA);
    const bStart = this.toMinutes(startB);
    const bEnd = this.toMinutes(endB);
    return aStart < bEnd && bStart < aEnd;
  }

  private toMinutes(time: string) {
    const [hourText, minuteText] = (time || '').split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      throw new BadRequestException(`Invalid time format: ${time}`);
    }
    return hour * 60 + minute;
  }
}
