import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ClassCreateDto,
  ClassDuplicateDto,
  ClassQueryDto,
  ClassUpdateDto,
  ClassModuleCreateDto,
  ClassModuleUpdateDto,
  ClassContentItemCreateDto,
  ClassContentItemUpdateDto,
} from './dto/class.dto';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class ClassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) { }

  async findAll(query: ClassQueryDto) {
    const q = query.q?.trim();
    return this.prisma.class.findMany({
      where: {
        courseProfileId: query.courseProfileId ?? undefined,
        mode: (query.mode as any) ?? undefined,
        status: (query.status as any) ?? undefined, ...(q
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
        liveSchedules: true,
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

    return this.prisma.$transaction(async (tx) => {
      const classItem = await tx.class.create({
        data: {
          courseProfileId: input.courseProfileId,
          code: input.code,
          name: input.name,
          mode: input.mode as any,
          status: (input.status as any) ?? 'DRAFT',
          settings: input.settings ?? undefined,
          defaultExpiresMonths: input.defaultExpiresMonths,
          openingDate: input.openingDate,
          closingDate: input.closingDate,
          instructorId: input.instructorId,
        } as any, // Cast to any because of transition state of types if needed
      });

      await this.audit.log({
        userId: requesterId,
        action: 'class.create',
        entity: 'Class',
        entityId: classItem.id,
        description: `Created ${input.mode} class ${input.code}`,
        metadata: { code: input.code, mode: input.mode },
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
          status: input.status as any,
          settings: input.settings ?? undefined,
          openingDate: input.openingDate,
          closingDate: input.closingDate,
          instructorId: input.instructorId,
          defaultExpiresMonths: input.defaultExpiresMonths,
        } as any,
      });

      await this.audit.log({
        userId: requesterId,
        action: 'class.update',
        entity: 'Class',
        entityId: id,
        description: `Updated class ${classItem.code}`,
        oldValues: { name: classItem.name, status: classItem.status },
        newValues: { name: updatedClass.name, status: updatedClass.status },
      });

      return updatedClass;
    });
  }

  async publishClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: {
        liveSchedules: { take: 1 },
      },
    });
    if (!classItem) throw new NotFoundException('Class not found');
    if (classItem.status !== 'DRAFT' && classItem.status !== 'PENDING_APPROVAL')
      return classItem;

    if (classItem.mode === 'LIVE') {
      if (!classItem.liveSchedules || classItem.liveSchedules.length === 0) {
        throw new BadRequestException(
          'LIVE classes must have at least one LiveSchedule',
        );
      }
    }

    const result = await this.prisma.class.update({
      where: { id },
      data: {
        status: 'ENROLLING',
        approvedAt: new Date(),
        approvedBy: requesterId,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.publish',
      entity: 'Class',
      entityId: id,
      description: `Published (Approved) class ${classItem.code}`,
      metadata: { code: classItem.code },
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
          'LIVE classes must have at least one LiveSchedule before submitting for approval',
        );
      }
    }

    const updated = await this.prisma.class.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
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
    // Reuse publishClass logic
    return this.publishClass(id, requesterId);
  }

  async reject(id: string, reason: string, requesterId: string) {
    const classItem = await this.findById(id);
    if (classItem.status !== 'PENDING_APPROVAL') {
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
      description: `Rejected class ${classItem.code} for reason: ${reason}`,
      metadata: { reason },
    });

    return updated;
  }

  async startClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);
    if (classItem.status === 'IN_PROGRESS') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.start',
      entity: 'Class',
      entityId: id,
      description: `Started class ${classItem.code}`,
      oldValues: { status: classItem.status },
      newValues: { status: 'IN_PROGRESS' },
    });

    return result;
  }

  async completeClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);
    if (classItem.status === 'COMPLETED') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.complete',
      entity: 'Class',
      entityId: id,
      description: `Completed class ${classItem.code}`,
      oldValues: { status: classItem.status },
      newValues: { status: 'COMPLETED' },
    });

    return result;
  }

  async cancelClass(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);
    if (classItem.status === 'CANCELLED') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'class.cancel',
      entity: 'Class',
      entityId: id,
      description: `Cancelled class ${classItem.code}`,
    });

    return result;
  }

  async getCurriculum(id: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      select: { id: true, courseProfileId: true },
    });

    if (!classItem) throw new NotFoundException('Class not found');

    const modules = await this.prisma.classModule.findMany({
      where: { classId: id },
      include: {
        items: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return {
      classId: classItem.id,
      courseProfileId: classItem.courseProfileId,
      modules: modules.map((m) => ({
        id: m.id,
        title: m.title,
        orderIndex: m.orderIndex,
        items: m.items.map((it) => ({
          id: it.id,
          kind: it.kind,
          referenceId: it.referenceId,
          orderIndex: it.orderIndex,
          status: it.status,
          availableFrom: it.availableFrom,
          deadline: it.deadline,
          isPrerequisite: it.isPrerequisite,
        })),
      })),
    };
  }

  async addModule(input: ClassModuleCreateDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true },
    });
    if (!klass) throw new NotFoundException('Class not found');

    const nextOrder =
      input.orderIndex ??
      ((await this.prisma.classModule.count({
        where: { classId: input.classId },
      })) + 1);

    return this.prisma.classModule.create({
      data: {
        classId: input.classId,
        title: input.title,
        orderIndex: nextOrder,
      },
    });
  }

  async updateModule(id: string, input: ClassModuleUpdateDto) {
    const module = await this.prisma.classModule.findUnique({
      where: { id },
    });
    if (!module) throw new NotFoundException('ClassModule not found');

    return this.prisma.classModule.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        orderIndex: input.orderIndex ?? undefined,
      },
    });
  }

  async deleteModule(id: string) {
    const module = await this.prisma.classModule.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!module) throw new NotFoundException('ClassModule not found');

    await this.prisma.classModule.delete({ where: { id } });
    return { ok: true };
  }

  async addContentItem(input: ClassContentItemCreateDto) {
    const module = await this.prisma.classModule.findUnique({
      where: { id: input.moduleId },
      select: { id: true },
    });
    if (!module) throw new NotFoundException('ClassModule not found');

    const nextOrder =
      input.orderIndex ??
      ((await this.prisma.classContentItem.count({
        where: { moduleId: input.moduleId },
      })) + 1);

    return this.prisma.classContentItem.create({
      data: {
        moduleId: input.moduleId,
        kind: input.kind,
        referenceId: input.referenceId ?? null,
        orderIndex: nextOrder,
        status: input.status ?? 'PUBLISHED',
        availableFrom: input.availableFrom ?? null,
        deadline: input.deadline ?? null,
        isPrerequisite: input.isPrerequisite ?? false,
        settings: input.settings ?? {},
      },
    });
  }

  async updateContentItem(id: string, input: ClassContentItemUpdateDto) {
    const item = await this.prisma.classContentItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('ClassContentItem not found');

    return this.prisma.classContentItem.update({
      where: { id },
      data: {
        kind: input.kind ?? undefined,
        referenceId:
          input.referenceId !== undefined ? input.referenceId : undefined,
        orderIndex: input.orderIndex ?? undefined,
        status: input.status ?? undefined,
        availableFrom:
          input.availableFrom !== undefined ? input.availableFrom : undefined,
        deadline: input.deadline !== undefined ? input.deadline : undefined,
        isPrerequisite:
          input.isPrerequisite !== undefined ? input.isPrerequisite : undefined,
        settings: input.settings ?? undefined,
      },
    });
  }

  async deleteContentItem(id: string) {
    const item = await this.prisma.classContentItem.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!item) throw new NotFoundException('ClassContentItem not found');

    await this.prisma.classContentItem.delete({ where: { id } });
    return { ok: true };
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const classItem = await this.findById(id);
    if (classItem.status !== 'DRAFT' && classItem.status !== 'CANCELLED') {
      throw new BadRequestException(
        'Can only delete DRAFT or CANCELLED classes',
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
      description: `Deleted class ${classItem.code} (status was: ${classItem.status})`,
      metadata: { code: classItem.code, mode: classItem.mode },
    });

    return { ok: true };
  }

  async duplicate(
    id: string,
    input?: ClassDuplicateDto,
    requesterId = 'SYSTEM',
  ) {
    const source = await this.prisma.class.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            items: true,
          },
        },
        assignments: true,
        liveSchedules: true,
      },
    });

    if (!source) throw new NotFoundException('Class not found');

    let targetCode = input?.code || `${source.code}_COPY_${Date.now()}`;
    const existing = await this.prisma.class.findUnique({
      where: { code: targetCode },
    });
    if (existing) {
      targetCode = `${targetCode}_${Math.floor(Math.random() * 1000)}`;
    }

    const targetName = input?.name || `${source.name} (Bản sao)`;

    return this.prisma.$transaction(async (tx) => {
      const newClass = await tx.class.create({
        data: {
          courseProfileId: source.courseProfileId,
          code: targetCode,
          name: targetName,
          mode: source.mode,
          status: 'DRAFT',
          settings: source.settings ?? undefined,
          defaultExpiresMonths: source.defaultExpiresMonths,
          openingDate: input?.openingDate || source.openingDate,
          closingDate: input?.closingDate || source.closingDate,
          instructorId: input?.instructorId || source.instructorId,
        },
      });

      const assignmentMap = new Map<string, string>();
      for (const assignment of source.assignments) {
        const newAssignment = await tx.assignment.create({
          data: {
            classId: newClass.id,
            title: assignment.title,
            instruction: assignment.instruction,
            attachments: assignment.attachments,
            maxScore: assignment.maxScore,
            status: 'DRAFT',
          },
        });
        assignmentMap.set(assignment.id, newAssignment.id);
      }

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

      for (const module of source.modules) {
        const newModule = await tx.classModule.create({
          data: {
            classId: newClass.id,
            title: module.title,
            orderIndex: module.orderIndex,
          },
        });

        for (const item of module.items) {
          let newReferenceId = item.referenceId;

          if (item.kind === 'ASSIGNMENT' && item.referenceId) {
            newReferenceId =
              assignmentMap.get(item.referenceId) || item.referenceId;
          } else if (item.kind === 'EXAM' && item.referenceId) {
            newReferenceId = await this.duplicateExam(tx, item.referenceId);
          }

          await tx.classContentItem.create({
            data: {
              moduleId: newModule.id,
              kind: item.kind,
              referenceId: newReferenceId,
              orderIndex: item.orderIndex,
              status: item.status,
              availableFrom: item.availableFrom,
              deadline: item.deadline,
              isPrerequisite: item.isPrerequisite,
            },
          });
        }
      }

      await this.audit.log({
        userId: requesterId,
        action: 'class.duplicate',
        entity: 'Class',
        entityId: newClass.id,
        description: `Duplicated class ${source.code} to ${targetCode}`,
        metadata: { sourceId: id, targetCode },
      });

      return tx.class.findUnique({
        where: { id: newClass.id },
        include: {
          modules: { include: { items: true } },
          instructor: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      });
    });
  }

  private async duplicateExam(tx: any, examId: string) {
    const sourceExam = await tx.exam.findUnique({
      where: { id: examId },
      include: {
        sections: { include: { examQuestions: true } },
      },
    });
    if (!sourceExam) return examId;

    const newExam = await tx.exam.create({
      data: {
        courseProfileId: sourceExam.courseProfileId,
        title: `${sourceExam.title} (Bản sao)`,
        description: sourceExam.description,
        examType: sourceExam.examType,
        level: sourceExam.level,
        totalTimeLimitMinutes: sourceExam.totalTimeLimitMinutes,
        status: 'DRAFT',
        settings: sourceExam.settings ?? undefined,
      },
    });

    for (const section of sourceExam.sections) {
      const newSection = await tx.examSection.create({
        data: {
          examId: newExam.id,
          title: section.title,
          instruction: section.instruction,
          timeLimitSeconds: section.timeLimitSeconds,
          orderIndex: section.orderIndex,
          sectionType: section.sectionType,
          metadata: section.metadata ?? undefined,
        },
      });

      if (section.examQuestions.length > 0) {
        await tx.examQuestion.createMany({
          data: section.examQuestions.map((q) => ({
            examId: newExam.id,
            sectionId: newSection.id,
            questionId: q.questionId,
            orderIndex: q.orderIndex,
            points: q.points,
            metadata: q.metadata ?? undefined,
          })),
        });
      }
    }

    return newExam.id;
  }

  private async assertPrimaryTeacherScheduleConflicts(
    classId: string,
    instructorId: string,
  ) {
    const ownSchedules = await this.prisma.liveSchedule.findMany({
      where: { classId },
      select: {
        weekday: true,
        startTime: true,
        endTime: true,
      },
    });
    if (ownSchedules.length === 0) return;

    const candidateSchedules = await this.prisma.liveSchedule.findMany({
      where: {
        classId: { not: classId },
        class: {
          instructorId,
          status: {
            in: ['DRAFT', 'PENDING_APPROVAL', 'ENROLLING', 'IN_PROGRESS'],
          },
        },
      },
      include: {
        class: {
          select: {
            code: true,
            name: true,
          },
        },
      },
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
    if (aEnd <= aStart || bEnd <= bStart) {
      throw new BadRequestException('Invalid schedule time range');
    }
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
