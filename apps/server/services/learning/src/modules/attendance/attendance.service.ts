import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import type { Attendance } from '@prisma/generated';
import type {
  AttendanceCreateDTO,
  AttendanceUpdateDTO,
  AttendanceQueryDTO,
  AttendanceResponseDTO,
  AttendancePaginatedResponse,
} from '@workspace/schemas';
import type { IAttendanceService } from '@server/learning/interfaces/services';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from '@server/learning/interfaces/repositories';

@Injectable()
export class AttendanceService implements IAttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @Inject(ATTENDANCE_REPOSITORY_TOKEN)
    private readonly attendanceRepository: IAttendanceRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  private toDTO(attendance: Attendance): AttendanceResponseDTO {
    return this.mapper.map<Attendance, AttendanceResponseDTO>(
      attendance,
      'Attendance',
      'AttendanceResponseDTO',
    );
  }

  async create(dto: AttendanceCreateDTO): Promise<AttendanceResponseDTO> {
    const created = await this.attendanceRepository.create({
      liveSession: { connect: { id: dto.liveSessionId } },
      user: { connect: { id: dto.userId } },
      status: dto.status || 'present',
      joinTime: dto.joinTime,
      leaveTime: dto.leaveTime,
      duration: dto.duration,
      notes: dto.notes,
    });
    return this.toDTO(created);
  }

  async update(
    id: string,
    dto: AttendanceUpdateDTO,
  ): Promise<AttendanceResponseDTO> {
    const attendance = await this.attendanceRepository.findById(id);
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    const updated = await this.attendanceRepository.update(id, {
      ...dto,
      updatedAt: new Date(),
    });
    return this.toDTO(updated);
  }

  async findById(id: string): Promise<AttendanceResponseDTO | null> {
    const attendance = await this.attendanceRepository.findById(id);
    return attendance ? this.toDTO(attendance) : null;
  }

  async findAll(
    query: AttendanceQueryDTO,
  ): Promise<AttendancePaginatedResponse> {
    const {
      page = 1,
      limit = 10,
      liveSessionId,
      userId,
      status,
      courseMasterId,
    } = query as any;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (liveSessionId) where.liveSessionId = liveSessionId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (courseMasterId) {
      where.liveSession = {
        courseMasterId: courseMasterId,
      };
    }

    const [total, items] = await Promise.all([
      this.attendanceRepository.count(where),
      this.attendanceRepository.findMany({
        skip,
        take: limit,
        where,
        include: { user: true },
      }),
    ]);

    return {
      data: items.map((item) => this.toDTO(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAttendance(
    liveSessionId: string,
    userId: string,
    status: string,
  ): Promise<AttendanceResponseDTO> {
    const existing = await this.attendanceRepository.findBySessionAndUser(
      liveSessionId,
      userId,
    );

    if (existing) {
      const updated = await this.attendanceRepository.update(existing.id, {
        status,
        updatedAt: new Date(),
      });
      return this.toDTO(updated);
    }

    const created = await this.attendanceRepository.create({
      liveSession: { connect: { id: liveSessionId } },
      user: { connect: { id: userId } },
      status: status || 'present',
      joinTime: new Date(), // Assume join now if marking present
    });
    return this.toDTO(created);
  }

  async processUserJoined(
    liveSessionId: string,
    userId: string,
  ): Promise<void> {
    const existing = await this.attendanceRepository.findBySessionAndUser(
      liveSessionId,
      userId,
    );
    const now = new Date();

    if (existing) {
      await this.attendanceRepository.update(existing.id, {
        joinTime: now,
        updatedAt: now,
      });
    } else {
      await this.attendanceRepository.create({
        liveSession: { connect: { id: liveSessionId } },
        user: { connect: { id: userId } },
        status: 'absent', // Default to absent until duration threshold met
        joinTime: now,
      });
    }
  }

  async processUserLeft(liveSessionId: string, userId: string): Promise<void> {
    const existing = await this.attendanceRepository.findBySessionAndUser(
      liveSessionId,
      userId,
    );
    if (!existing || !existing.joinTime) return;

    const now = new Date();
    const sessionDurationSeconds = Math.floor(
      (now.getTime() - existing.joinTime.getTime()) / 1000,
    );

    await this.attendanceRepository.update(existing.id, {
      leaveTime: now,
      duration: { increment: sessionDurationSeconds },
      updatedAt: now,
    });
  }

  async processFinalAttendance(liveSessionId: string): Promise<void> {
    const attendances = (await this.attendanceRepository.findMany({
      skip: 0,
      take: 1000, // Process all enrollees
      where: { liveSessionId },
      include: { liveSession: true },
    })) as any[];

    for (const attendance of attendances) {
      // liveSession.duration is in minutes, convert to seconds
      const plannedDurationSeconds =
        (attendance.liveSession?.duration || 90) * 60;
      const thresholdSeconds = plannedDurationSeconds * 0.7;
      const isPresent = attendance.duration >= thresholdSeconds;

      await this.attendanceRepository.update(attendance.id, {
        status: isPresent ? 'present' : 'absent',
        updatedAt: new Date(),
      });
    }
  }
}
