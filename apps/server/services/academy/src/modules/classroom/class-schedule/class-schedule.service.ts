import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ClassScheduleCreateDto,
  ClassScheduleQueryDto,
  ClassScheduleUpdateDto,
} from './dto/class-schedule.dto';

@Injectable()
export class ClassScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ClassScheduleQueryDto) {
    return this.prisma.classSchedule.findMany({
      where: { classId: query.classId ?? undefined },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.classSchedule.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('ClassSchedule not found');
    return item;
  }

  async create(input: ClassScheduleCreateDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true, mode: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');
    const mode = (klass.mode ?? '').toUpperCase();
    if (mode === 'VOD') {
      throw new BadRequestException('Cannot create schedule for VOD class');
    }

    return this.prisma.classSchedule.create({
      data: {
        classId: input.classId,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        note: input.note,
      },
    });
  }

  async update(id: string, input: ClassScheduleUpdateDto) {
    await this.findById(id);
    return this.prisma.classSchedule.update({
      where: { id },
      data: {
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        note: input.note,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.classSchedule.delete({ where: { id } });
    return { ok: true };
  }
}

