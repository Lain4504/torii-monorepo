import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { LiveScheduleService } from '../live-schedule/live-schedule.service';
import {
  AcademyLiveClassCreateDTO,
  AcademyLiveClassUpdateDTO,
  AcademyLiveClassQueryDTO,
} from '@workspace/schemas';

@Injectable()
export class LiveClassService {
  constructor(
    private prisma: PrismaService,
    private liveSchedules: LiveScheduleService,
  ) { }

  async findAll(query: AcademyLiveClassQueryDTO) {
    const and: any[] = [];
    if (query.cohortId) and.push({ cohortId: query.cohortId });
    if (query.status) and.push({ status: query.status });
    if (query.instructorId) and.push({ instructorId: query.instructorId });

    const q = query as any;
    const cohortConditions: any[] = [];

    if (q.month) {
      const [year, month] = q.month.split('-').map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      cohortConditions.push({
        startDate: {
          gte: start,
          lte: end,
        },
      });
    }

    if (q.level) {
      cohortConditions.push({
        courseProfile: {
          level: q.level,
        },
      });
    }

    if (q.onlyAvailable) {
      cohortConditions.push({
        OR: [
          { enrollmentCloseAt: null },
          { enrollmentCloseAt: { gte: new Date() } },
        ],
      });
    }

    if (q.upcomingRegistration) {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

      cohortConditions.push({
        AND: [
          {
            OR: [
              { enrollmentOpenAt: null },
              { enrollmentOpenAt: { lte: endOfNextMonth } },
            ],
          },
          {
            OR: [
              { enrollmentCloseAt: null },
              { enrollmentCloseAt: { gte: startOfThisMonth } },
            ],
          },
        ],
      });
    }

    if (cohortConditions.length > 0) {
      and.push({ cohort: { AND: cohortConditions } });
    }

    if (query.q) {
      and.push({
        OR: [
          { code: { contains: query.q, mode: 'insensitive' } },
          { name: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }

    const where = and.length > 0 ? { AND: and } : {};

    const [items, total] = await Promise.all([
      this.prisma.liveClass.findMany({
        where,
        include: {
          instructor: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          cohort: {
            include: {
              courseProfile: {
                select: {
                  id: true,
                  title: true,
                  thumbnailUrl: true,
                  level: true,
                  description: true,
                },
              },
            },
          },
          liveSchedules: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.liveClass.count({ where }),
    ]);
    return { items, total };
  }

  async findById(id: string) {
    const item = await this.prisma.liveClass.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        cohort: {
          include: {
            courseProfile: {
              include: {
                modules: { include: { lessons: true } },
              },
            },
          },
        },
        liveSchedules: true,
        _count: { select: { enrollments: true } },
      },
    });
    if (!item) throw new NotFoundException('Live Class not found');
    return item;
  }

  async create(data: AcademyLiveClassCreateDTO) {
    const dataWithSchedules = data as AcademyLiveClassCreateDTO & { schedules?: any[] };
    if (dataWithSchedules.schedules?.length) {
      for (const s of dataWithSchedules.schedules) {
        await this.liveSchedules.assertNoScheduleConflicts({
          cohortId: data.cohortId,
          weekday: s.weekday,
          startTime: s.startTime,
          endTime: s.endTime,
          instructorId: data.instructorId,
        });
      }
    }

    const klass = await this.prisma.liveClass.create({
      data: {
        cohortId: data.cohortId,
        code: data.code,
        name: data.name,
        instructorId: data.instructorId ?? null,
        maxStudents: data.maxStudents,
        status: (data.status as any) ?? 'DRAFT',
      },
    });

    if (dataWithSchedules.schedules?.length) {
      for (const s of dataWithSchedules.schedules) {
        await this.liveSchedules.create({
          classId: klass.id,
          weekday: s.weekday,
          startTime: s.startTime,
          endTime: s.endTime,
        }, 'SYSTEM');
      }
    }

    return klass;
  }

  async update(id: string, data: AcademyLiveClassUpdateDTO) {
    if (data.status === 'OPENING') {
      await this.validateForPublishing(id);
    }

    return this.prisma.liveClass.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        status: data.status as any,
        instructorId: data.instructorId,
        maxStudents: data.maxStudents,
      },
    });
  }

  private async validateForPublishing(id: string) {
    const schedules = await this.prisma.liveSchedule.count({
      where: { liveClassId: id },
    });
    if (schedules === 0) {
      throw new BadRequestException(
        'Lớp LIVE cần có ít nhất 1 lịch học tuần trước khi xuất bản',
      );
    }
  }

  async delete(id: string) {
    await this.prisma.liveClass.delete({ where: { id } });
    return { ok: true };
  }

  async findAssignments(classId: string) {
    return this.prisma.liveClassAssignment.findMany({
      where: { liveClassId: classId },
      include: { assignment: true, _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAssignment(data: any) {
    let assignmentId = data.assignmentId;

    // 1. If no assignmentId, create a master Assignment content first
    if (!assignmentId && data.title && data.instructions) {
      const assignment = await this.prisma.assignment.create({
        data: {
          title: data.title,
          instructions: data.instructions,
        },
      });
      assignmentId = assignment.id;
    }

    if (!assignmentId) {
      throw new BadRequestException('assignmentId or title/instructions required');
    }

    // 2. Link the assignment to the live class
    return this.prisma.liveClassAssignment.create({
      data: {
        liveClassId: data.liveClassId,
        assignmentId,
        titleOverride: data.titleOverride,
        openAt: data.openAt,
        deadline: data.deadline,
      },
      include: { assignment: true },
    });
  }

  async getAssignmentById(id: string) {
    const item = await this.prisma.liveClassAssignment.findUnique({
      where: { id },
      include: { assignment: true },
    });
    if (!item) throw new NotFoundException('LiveClassAssignment not found');
    return item;
  }

  async updateAssignment(id: string, input: any) {
    const existing = await this.getAssignmentById(id);

    // Update the link details
    const updatedLink = await this.prisma.liveClassAssignment.update({
      where: { id },
      data: {
        titleOverride: input.titleOverride,
        openAt: input.openAt,
        deadline: input.deadline,
      },
      include: { assignment: true },
    });

    // If title or instructions are provided, update the underlying master Assignment
    if (input.title || input.instructions) {
      await this.prisma.assignment.update({
        where: { id: existing.assignmentId },
        data: {
          title: input.title,
          instructions: input.instructions,
        },
      });

      // Refresh to get updated assignment content
      return this.getAssignmentById(id);
    }

    return updatedLink;
  }

  async removeAssignment(id: string) {
    await this.prisma.liveClassAssignment.delete({ where: { id } });
    return { ok: true };
  }
}
