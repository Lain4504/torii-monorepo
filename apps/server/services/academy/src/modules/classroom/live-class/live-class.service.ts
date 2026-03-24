import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { LiveScheduleService } from '../live-schedule/live-schedule.service';
import { AcademyLiveClassCreateDTO, AcademyLiveClassUpdateDTO, AcademyLiveClassQueryDTO } from '@workspace/schemas';

@Injectable()
export class LiveClassService {
  constructor(
    private prisma: PrismaService,
    private liveSchedules: LiveScheduleService
  ) {}

  async findAll(query: AcademyLiveClassQueryDTO) {
    const where: any = {};
    if (query.cohortId) where.cohortId = query.cohortId;
    if (query.status) where.status = query.status;
    if (query.instructorId) where.instructorId = query.instructorId;
    const q = query as any;
    if (q.month) {
      const [year, month] = q.month.split('-').map(Number);
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      where.cohort = {
        startDate: {
          gte: start,
          lte: end,
        },
      };
    }

    if (query.q) {
      where.OR = [
        { code: { contains: query.q, mode: 'insensitive' } },
        { name: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    
    const [items, total] = await Promise.all([
      this.prisma.liveClass.findMany({
        where,
        include: {
          instructor: { select: { id: true, displayName: true, avatarUrl: true } },
          cohort: {
            include: {
              courseProfile: { select: { id: true, title: true, thumbnailUrl: true, level: true, description: true } },
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
        instructor: { select: { id: true, displayName: true, avatarUrl: true } },
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
        _count: { select: { enrollments: true } }
      },
    });
    if (!item) throw new NotFoundException('Live Class not found');
    return item;
  }

  async create(data: AcademyLiveClassCreateDTO) {
    return this.prisma.liveClass.create({
      data: {
        cohortId: data.cohortId,
        code: data.code,
        name: data.name,
        instructorId: data.instructorId,
        maxStudents: data.maxStudents,
        status: data.status as any ?? 'DRAFT',
      },
    });
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
    const schedules = await this.prisma.liveSchedule.count({ where: { liveClassId: id } });
    if (schedules === 0) {
      throw new BadRequestException('Lớp LIVE cần có ít nhất 1 lịch học tuần trước khi xuất bản');
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
