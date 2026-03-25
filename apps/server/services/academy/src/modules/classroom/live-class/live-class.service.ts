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
  ) {}

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

    if (q.onlyAvailable) {
      cohortConditions.push({
        OR: [
          { enrollmentCloseAt: null },
          { enrollmentCloseAt: { gte: new Date() } },
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
    return this.prisma.liveClassAssignment.create({
      data: {
        liveClassId: data.liveClassId,
        assignmentId: data.assignmentId,
        titleOverride: data.titleOverride,
        openAt: data.openAt,
        deadline: data.deadline,
      },
      include: { assignment: true },
    });
  }
}
