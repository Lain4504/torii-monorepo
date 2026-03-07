import { BadRequestException, Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ClassScheduleCreateDto,
  ClassScheduleQueryDto,
  ClassScheduleUpdateDto,
} from './dto/class-schedule.dto';
import { create } from '@bufbuild/protobuf';
import { CreateRoomReqSchema, RoomMetadataSchema, RoomCreateFeaturesSchema } from '@workspace/protocol';

@Injectable()
export class ClassScheduleService {
  private readonly logger = new Logger(ClassScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('NATS_SERVICE') private readonly nats: ClientProxy,
  ) { }

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
      select: { id: true, mode: true, code: true, name: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');
    const mode = (klass.mode ?? '').toUpperCase();
    if (mode === 'VOD') {
      throw new BadRequestException('Cannot create schedule for VOD class');
    }

    const roomId = `class-${klass.id.substring(0, 8)}-${Date.now()}`;

    const schedule = await this.prisma.classSchedule.create({
      data: {
        classId: input.classId,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        note: input.note,
        roomId: roomId,
      },
    });

    // =========================================================================
    // NATS ROOM CREATION - DEFERRED (LAZY LOAD)
    // =========================================================================
    // We intentionally DO NOT call NATS `room.create` here.
    // 1. NATS KV TTL constraint: The Meet service sets a 7-day TTL on JetStream buckets.
    //    If we create the room here, and the class is > 7 days away, the room will expire and break.
    // 2. Resource optimization: JetStream Streams (KV Buckets) are heavy. Creating thousands 
    //    of future schedules in advance would drain NATS Stream cluster resources.
    // 
    // SOLUTION: We only generate the `roomId` and save it. 
    // The actual `room.create` will be called "Just In Time" (JIT) 
    // when the Lecturer clicks "Start Session" before the class time.

    return schedule;
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

