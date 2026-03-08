import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ClassCreateDto, ClassQueryDto, ClassUpdateDto } from './dto/class.dto';
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
        courseEditionId: query.courseEditionId ?? undefined,
        mode: (query.mode as any) ?? undefined,
        status: (query.status as any) ?? undefined,
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
        vodClass: true,
        liveClass: {
          include: {
            primaryTeacher: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            schedules: true,
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
        vodClass: true,
        liveClass: {
          include: {
            primaryTeacher: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            schedules: true,
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Class not found');
    return item;
  }

  async create(input: ClassCreateDto) {
    const edition = await this.prisma.courseEdition.findUnique({
      where: { id: input.courseEditionId },
      select: { id: true, courseProfileId: true },
    });
    if (!edition) throw new BadRequestException('Invalid courseEditionId');
    if (edition.courseProfileId !== input.courseProfileId) {
      throw new BadRequestException('courseEditionId does not belong to courseProfileId');
    }

    return this.prisma.$transaction(async (tx) => {
      const classItem = await tx.class.create({
        data: {
          courseProfileId: input.courseProfileId,
          courseEditionId: input.courseEditionId,
          code: input.code,
          name: input.name,
          mode: input.mode as any,
          status: (input.status as any) ?? 'DRAFT',
          settings: input.settings ?? undefined,
        },
      });

      if (input.mode === 'VOD') {
        await tx.vodClass.create({
          data: {
            classId: classItem.id,
            enrollmentOpenAt: input.enrollmentOpenAt,
            enrollmentCloseAt: input.enrollmentCloseAt,
            maxStudents: input.maxStudents,
            defaultExpiresMonths: input.defaultExpiresMonths,
          },
        });
      } else if (input.mode === 'LIVE') {
        if (!input.startDate || !input.endDate) {
          throw new BadRequestException('LIVE classes must have startDate and endDate');
        }
        await tx.liveClass.create({
          data: {
            classId: classItem.id,
            term: input.term,
            batch: input.batch,
            startDate: input.startDate,
            endDate: input.endDate,
            enrollmentOpenAt: input.enrollmentOpenAt ?? input.startDate,
            enrollmentCloseAt: input.enrollmentCloseAt ?? input.startDate,
            minStudents: input.minStudents ?? 0,
            maxStudents: input.maxStudents ?? 0,
            minStudentsEnforcement: input.minStudentsEnforcement as any,
            primaryTeacherId: input.primaryTeacherId,
          },
        });
      }

      await this.audit.log({
        userId: 'SYSTEM',
        action: 'class.create',
        entity: 'Class',
        entityId: classItem.id,
        description: `Created ${input.mode} class ${input.code}`,
        metadata: { code: input.code, mode: input.mode },
      });

      return classItem;
    });
  }

  async update(id: string, input: ClassUpdateDto) {
    const classItem = await this.findById(id);

    return this.prisma.$transaction(async (tx) => {
      const updatedClass = await tx.class.update({
        where: { id },
        data: {
          name: input.name,
          status: input.status as any,
          settings: input.settings ?? undefined,
        },
      });

      if (classItem.mode === 'VOD') {
        await tx.vodClass.update({
          where: { classId: id },
          data: {
            enrollmentOpenAt: input.enrollmentOpenAt,
            enrollmentCloseAt: input.enrollmentCloseAt,
            maxStudents: input.maxStudents,
            defaultExpiresMonths: input.defaultExpiresMonths,
          },
        });
      } else if (classItem.mode === 'LIVE') {
        await tx.liveClass.update({
          where: { classId: id },
          data: {
            term: input.term,
            batch: input.batch,
            startDate: input.startDate,
            endDate: input.endDate,
            enrollmentOpenAt: input.enrollmentOpenAt,
            enrollmentCloseAt: input.enrollmentCloseAt,
            minStudents: input.minStudents,
            maxStudents: input.maxStudents,
            minStudentsEnforcement: input.minStudentsEnforcement as any,
            primaryTeacherId: input.primaryTeacherId,
          },
        });
      }

      await this.audit.log({
        userId: 'SYSTEM',
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

  async publishClass(id: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: {
        courseEdition: true,
        liveClass: { include: { schedules: { take: 1 } } },
      },
    });
    if (!classItem) throw new NotFoundException('Class not found');
    if (classItem.status !== 'DRAFT' && classItem.status !== 'PENDING_APPROVAL') return classItem;

    if (classItem.courseEdition.status !== 'PUBLISHED') {
      throw new BadRequestException('Cannot publish class for a non-PUBLISHED edition');
    }

    if (classItem.mode === 'LIVE') {
      if (!classItem.liveClass?.schedules || classItem.liveClass.schedules.length === 0) {
        throw new BadRequestException('LIVE classes must have at least one LiveSchedule');
      }
    }

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'ENROLLING' },
    });

    await this.audit.log({
      userId: 'SYSTEM',
      action: 'class.publish',
      entity: 'Class',
      entityId: id,
      description: `Published class ${classItem.code}`,
      metadata: { code: classItem.code },
    });

    return result;
  }

  async startClass(id: string) {
    const classItem = await this.findById(id);
    if (classItem.status === 'IN_PROGRESS') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });

    await this.audit.log({
      userId: 'SYSTEM',
      action: 'class.start',
      entity: 'Class',
      entityId: id,
      description: `Started class ${classItem.code}`,
      oldValues: { status: classItem.status },
      newValues: { status: 'IN_PROGRESS' },
    });

    return result;
  }

  async completeClass(id: string) {
    const classItem = await this.findById(id);
    if (classItem.status === 'COMPLETED') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    await this.audit.log({
      userId: 'SYSTEM',
      action: 'class.complete',
      entity: 'Class',
      entityId: id,
      description: `Completed class ${classItem.code}`,
      oldValues: { status: classItem.status },
      newValues: { status: 'COMPLETED' },
    });

    return result;
  }

  async cancelClass(id: string) {
    const classItem = await this.findById(id);
    if (classItem.status === 'CANCELLED') return classItem;

    const result = await this.prisma.class.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.audit.log({
      userId: 'SYSTEM',
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
      include: {
        courseEdition: {
          include: {
            chapters: {
              include: {
                items: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!classItem) throw new NotFoundException('Class not found');

    return {
      classId: classItem.id,
      courseProfileId: classItem.courseProfileId,
      courseEditionId: classItem.courseEditionId,
      chapters: classItem.courseEdition.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex,
        estimatedMinutes: chapter.estimatedMinutes,
        items: chapter.items.map((item) => ({
          id: item.id,
          title: item.title,
          kind: item.kind,
          referenceId: item.referenceId,
          orderIndex: item.orderIndex,
          metadata: item.metadata,
        })),
      })),
    };
  }

  async delete(id: string) {
    const classItem = await this.findById(id);
    if (classItem.status !== 'DRAFT' && classItem.status !== 'CANCELLED') {
      throw new BadRequestException('Can only delete DRAFT or CANCELLED classes');
    }

    const enrollCount = await this.prisma.enrollment.count({ where: { classId: id } });
    if (enrollCount > 0) {
      throw new BadRequestException('Cannot delete class with existing enrollments');
    }

    await this.prisma.class.delete({ where: { id } });

    await this.audit.log({
      userId: 'SYSTEM',
      action: 'class.delete',
      entity: 'Class',
      entityId: id,
      description: `Deleted class ${classItem.code} (status was: ${classItem.status})`,
      metadata: { code: classItem.code, mode: classItem.mode },
    });

    return { ok: true };
  }
}
