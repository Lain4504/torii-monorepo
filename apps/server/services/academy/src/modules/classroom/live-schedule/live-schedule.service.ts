import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  LiveScheduleCreateDto,
  LiveScheduleQueryDto,
  LiveScheduleUpdateDto,
} from './dto/live-schedule.dto';
import {
  LiveScheduleConflictPreviewDto,
  LiveScheduleRequestApproveDto,
  LiveScheduleRequestCreateDto,
  LiveScheduleRequestQueryDto,
  LiveScheduleRequestRejectDto,
} from './dto/live-schedule-request.dto';
import { create } from '@bufbuild/protobuf';
import {
  RoomMetadataSchema,
  RoomCreateFeaturesSchema,
  GenerateTokenReqSchema,
  UserInfoSchema,
  UserMetadataSchema,
} from '@workspace/protocol';
import { AppConfigService } from '@server/shared';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class LiveScheduleService {
  private readonly logger = new Logger(LiveScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfig: AppConfigService,
    @Inject('NATS_SERVICE') private readonly nats: ClientProxy,
    private readonly audit: AuditLoggerService,
  ) {}

  private buildSessionRoomId() {
    // Generate a short, concise roomId similar to Google Meet (e.g., abc-defg-hij)
    // Here we use 3-3-3 pattern for consistency
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segment = (len: number) =>
      Array.from({ length: len }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');

    return `${segment(3)}-${segment(3)}-${segment(3)}`;
  }

  private async assertTemplateMutable(classId: string) {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { status: true, mode: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');
    // After class becomes public, template schedules are frozen; changes must go through session requests.
    const status = String(klass.status);
    const allowed = status === 'DRAFT' || status === 'PENDING_APPROVAL';
    if (!allowed) {
      throw new BadRequestException(
        'LiveSchedule is locked after class is published. Please use session change requests.',
      );
    }
  }

  async findAll(query: LiveScheduleQueryDto) {
    return this.prisma.liveSchedule.findMany({
      where: { classId: query.classId ?? undefined },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
      include: {
        class: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.liveSchedule.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!item) throw new NotFoundException('LiveSchedule not found');
    return item;
  }

  async create(input: LiveScheduleCreateDto, requesterId = 'SYSTEM') {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
    });
    if (!klass) throw new BadRequestException('Invalid classId');
    await this.assertTemplateMutable(input.classId);
    await this.assertNoScheduleConflicts({
      classId: input.classId,
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      instructorId: klass.instructorId,
    });

    const roomId = this.buildSessionRoomId();

    const schedule = await this.prisma.liveSchedule.create({
      data: {
        classId: input.classId,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        roomId: roomId,
      },
    });

    // Hybrid: pre-generate instances for near future so UI có data ngay.
    // Migration DB sẽ được chạy sau; nếu bảng chưa tồn tại thì bỏ qua để không chặn tạo template.
    if (klass.openingDate && klass.closingDate) {
      try {
        await this.generateInstancesForClassRange(input.classId, requesterId);
      } catch (err) {
        this.logger.warn(
          `generateInstancesForClassRange skipped after create schedule: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    await this.audit.log({
      userId: requesterId,
      action: 'live_schedule.create',
      entity: 'LiveSchedule',
      entityId: schedule.id,
      description: `Created live schedule for class: ${klass.name}`,
      newValues: {
        classId: schedule.classId,
        weekday: schedule.weekday,
        startTime: schedule.startTime,
      },
    });

    return schedule;
  }

  async join(id: string, userId: string, isAdmin = false) {
    const schedule = await this.prisma.liveSchedule.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            courseProfile: { select: { title: true } },
            instructor: { select: { id: true } },
          },
        },
      },
    });

    if (!schedule) throw new NotFoundException('Session not found');

    this.assertClassJoinable(schedule.class.status);
    this.assertInJoinWindow(
      {
        weekday: schedule.weekday,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
      isAdmin,
    );

    const user = await this.getUserById(userId);
    await this.assertJoinPermission(schedule, userId, isAdmin, user?.role);
    const roomId = await this.ensureScheduleRoomId(
      schedule.id,
      schedule.roomId,
      schedule.classId,
    );

    // 1) Check room active status (contract must match Meet handler: room.isActive)
    const roomExists = await this.sendNatsWithRetry(
      { cmd: 'room.isActive' },
      { roomId },
      2,
    ).catch(() => ({ isActive: false }));
    const isRoomActive = Boolean(
      roomExists?.isActive ?? roomExists?.status ?? false,
    );

    if (!isRoomActive) {
      if (!isAdmin) {
        throw new BadRequestException(
          'Phòng học chưa được giảng viên khởi tạo.',
        );
      }

      const roomTitle =
        schedule.class.courseProfile?.title || schedule.class.name;
      const roomInfo = this.getDefaultRoomInfo(roomId, roomTitle, {
        classId: schedule.classId,
        weekday: schedule.weekday,
        startTime: schedule.startTime,
      });

      await this.sendNatsWithRetry({ cmd: 'room.create' }, roomInfo, 2).catch(
        (err) => {
          this.logger.error(
            `Failed to create room ${roomId} for live class ${schedule.classId}: ${
              err instanceof Error ? err.message : err
            }`,
          );
          throw new BadRequestException(
            'Không thể khởi tạo phòng học. Vui lòng thử lại.',
          );
        },
      );

      await this.audit.log({
        userId,
        action: 'live_schedule.room_create',
        entity: 'LiveSchedule',
        entityId: schedule.id,
        description: `Created meet room ${roomId} for live schedule`,
        metadata: { roomId, classId: schedule.classId },
      });
    }

    // 2) Generate join token with metadata
    const joinReq = create(GenerateTokenReqSchema, {
      roomId,
      userInfo: create(UserInfoSchema, {
        userId: userId,
        name: user?.displayName || (isAdmin ? 'Lecturer' : 'Student'),
        isAdmin: isAdmin,
        userMetadata: create(UserMetadataSchema, {
          profilePic: user?.avatarUrl || undefined,
          isAdmin: isAdmin,
        }),
      }),
    });

    const tokenRes = await this.sendNatsWithRetry(
      { cmd: 'user.generateJoinToken' },
      joinReq,
      2,
    );

    await this.audit.log({
      userId,
      action: 'live_schedule.join',
      entity: 'LiveSchedule',
      entityId: schedule.id,
      description: `User joined live schedule ${schedule.id} as ${isAdmin ? 'lecturer' : 'student'}`,
      metadata: {
        roomId,
        classId: schedule.classId,
        role: isAdmin ? 'lecturer' : 'student',
      },
    });

    return {
      token: tokenRes.token,
      roomId,
      userId: userId,
      roomTitle: schedule.class.courseProfile?.title || schedule.class.name,
    };
  }

  async joinBySessionId(sessionId: string, userId: string, isAdmin = false) {
    const session = await this.prisma.liveScheduleSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            courseProfile: { select: { title: true } },
            instructor: { select: { id: true } },
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Session not found');

    if (session.status !== 'SCHEDULED') {
      throw new BadRequestException(
        'Buổi học đã bị hủy hoặc đã được dời. Chỉ buổi có trạng thái SCHEDULED mới được tham gia.',
      );
    }

    this.assertClassJoinable(session.class.status);
    this.assertInJoinWindowForSession(
      {
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime,
      },
      isAdmin,
    );

    const user = await this.getUserById(userId);
    // Reuse existing permission logic (class enrollment/role checks) by faking a schedule-like shape.
    await this.assertJoinPermission(
      {
        id: sessionId,
        classId: session.classId,
        class: session.class,
      } as any,
      userId,
      isAdmin,
      user?.role,
    );

    const roomId = await this.ensureSessionRoomId(sessionId, session.roomId);

    const roomExists = await this.sendNatsWithRetry(
      { cmd: 'room.isActive' },
      { roomId },
      2,
    ).catch(() => ({ isActive: false }));
    const isRoomActive = Boolean(
      roomExists?.isActive ?? roomExists?.status ?? false,
    );

    if (!isRoomActive) {
      if (!isAdmin) {
        throw new BadRequestException(
          'Phòng học chưa được giảng viên khởi tạo.',
        );
      }

      const roomTitle =
        session.class.courseProfile?.title || session.class.name;
      const roomInfo = this.getDefaultRoomInfo(roomId, roomTitle, {
        classId: session.classId,
        weekday: new Date(session.sessionDate).getUTCDay(),
        startTime: session.startTime,
      });

      await this.sendNatsWithRetry({ cmd: 'room.create' }, roomInfo, 2).catch(
        (err) => {
          this.logger.error(
            `Failed to create room ${roomId} for live session ${sessionId}: ${
              err instanceof Error ? err.message : err
            }`,
          );
          throw new BadRequestException(
            'Không thể khởi tạo phòng học. Vui lòng thử lại.',
          );
        },
      );

      await this.audit.log({
        userId,
        action: 'live_session.room_create',
        entity: 'LiveScheduleSession',
        entityId: sessionId,
        description: `Created meet room ${roomId} for live session`,
        metadata: { roomId, classId: session.classId },
      });
    }

    const joinReq = create(GenerateTokenReqSchema, {
      roomId,
      userInfo: create(UserInfoSchema, {
        userId: userId,
        name: user?.displayName || (isAdmin ? 'Lecturer' : 'Student'),
        isAdmin: isAdmin,
        userMetadata: create(UserMetadataSchema, {
          profilePic: user?.avatarUrl || undefined,
          isAdmin: isAdmin,
        }),
      }),
    });

    const tokenRes = await this.sendNatsWithRetry(
      { cmd: 'user.generateJoinToken' },
      joinReq,
      2,
    );

    await this.audit.log({
      userId,
      action: 'live_session.join',
      entity: 'LiveScheduleSession',
      entityId: sessionId,
      description: `User joined live session ${sessionId} as ${isAdmin ? 'lecturer' : 'student'}`,
      metadata: {
        roomId,
        classId: session.classId,
        role: isAdmin ? 'lecturer' : 'student',
      },
    });

    return {
      token: tokenRes.token,
      roomId,
      userId: userId,
      roomTitle: session.class.courseProfile?.title || session.class.name,
    };
  }

  async update(
    id: string,
    input: LiveScheduleUpdateDto,
    requesterId = 'SYSTEM',
  ) {
    const oldSchedule = await this.findById(id);
    await this.assertTemplateMutable(oldSchedule.classId);
    const klass = await this.prisma.class.findUnique({
      where: { id: oldSchedule.classId },
      select: {
        instructorId: true,
        id: true,
        openingDate: true,
        closingDate: true,
      },
    });
    await this.assertNoScheduleConflicts({
      classId: oldSchedule.classId,
      weekday: input.weekday ?? oldSchedule.weekday,
      startTime: input.startTime ?? oldSchedule.startTime,
      endTime: input.endTime ?? oldSchedule.endTime,
      instructorId: klass?.instructorId,
      excludeScheduleId: id,
    });

    const updated = await this.prisma.liveSchedule.update({
      where: { id },
      data: {
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
      },
    });

    const actorId = requesterId === 'SYSTEM' ? null : requesterId;

    // Hybrid: re-generate horizon gần để reflect thay đổi template
    if (klass?.openingDate && klass?.closingDate) {
      try {
        await this.generateInstancesForClassRange(
          oldSchedule.classId,
          requesterId,
        );
      } catch (err) {
        this.logger.warn(
          `generateInstancesForClassRange skipped after update schedule: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    await this.audit.log({
      userId: requesterId,
      action: 'live_schedule.update',
      entity: 'LiveSchedule',
      entityId: id,
      description: `Updated live schedule for session ${id}`,
      oldValues: {
        weekday: oldSchedule.weekday,
        startTime: oldSchedule.startTime,
      },
      newValues: {
        weekday: updated.weekday,
        startTime: updated.startTime,
      },
    });

    return updated;
  }

  async listSessionsForClassRange(classId: string, from: Date, to: Date) {
    return this.prisma.liveScheduleSession.findMany({
      where: {
        classId,
        sessionDate: {
          gte: this.startOfDay(from),
          lte: this.startOfDay(to),
        },
      },
      orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
    });
  }

  async generateInstancesForClassRange(
    classId: string,
    requesterId = 'SYSTEM',
  ) {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        instructorId: true,
        openingDate: true,
        closingDate: true,
      },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    // Clamp the requested range into the Class boundaries
    const classStart = klass.openingDate
      ? this.startOfDay(klass.openingDate)
      : null;
    const classEnd = klass.closingDate
      ? this.startOfDay(klass.closingDate)
      : null;

    if (!classStart || !classEnd) {
      // If no boundaries, we cannot safely target any range.
      return {
        ok: true,
        upserted: 0,
        message: 'Class range is not set. No sessions generated.',
      };
    }

    const start = classStart;
    const end = classEnd;

    if (end < start) {
      // Range is empty or invalid.
      return { ok: true, upserted: 0 };
    }

    const templates = await this.prisma.liveSchedule.findMany({
      where: { classId },
      select: {
        id: true,
        weekday: true,
        startTime: true,
        endTime: true,
        roomId: true,
      },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
    });

    let cursor = start;
    const ops: Array<
      ReturnType<PrismaService['liveScheduleSession']['upsert']>
    > = [];
    const generatedSlots: Array<{
      sessionDate: Date;
      startTime: string;
      endTime: string;
    }> = [];

    while (true) {
      const weekday = cursor.getUTCDay(); // 0-6, align với LiveSchedule.weekday
      const matches = templates.filter((t) => t.weekday === weekday);

      for (const t of matches) {
        const sessionDate = this.startOfDay(cursor);
        generatedSlots.push({
          sessionDate,
          startTime: t.startTime,
          endTime: t.endTime,
        });

        const roomId = t.roomId || this.buildSessionRoomId();

        const actorId = requesterId === 'SYSTEM' ? null : requesterId;

        ops.push(
          this.prisma.liveScheduleSession.upsert({
            where: {
              classId_sessionDate_startTime_endTime: {
                classId,
                sessionDate,
                startTime: t.startTime,
                endTime: t.endTime,
              },
            },
            create: {
              classId,
              scheduleId: t.id,
              sessionDate,
              startTime: t.startTime,
              endTime: t.endTime,
              status: 'SCHEDULED',
              roomId,
              instructorId: klass.instructorId ?? undefined,
              createdBy: actorId,
              updatedBy: actorId,
            },
            update: {
              scheduleId: t.id,
              roomId,
              instructorId: klass.instructorId ?? undefined,
              updatedBy: actorId,
            },
          }),
        );
      }

      if (cursor.getTime() >= end.getTime()) break;
      cursor = this.addDays(cursor, 1);
    }

    await this.prisma.$transaction(ops);

    // After upserting all valid sessions, cleanup "orphaned" template-linked sessions
    // that are still SCHEDULED but no longer match any current template slot in this range.
    // This handles the case where a schedule's time or weekday was changed.
    try {
      await this.prisma.liveScheduleSession.deleteMany({
        where: {
          classId,
          sessionDate: { gte: start, lte: end },
          scheduleId: { not: null },
          status: 'SCHEDULED',
          NOT: {
            OR: generatedSlots.map((slot) => ({
              sessionDate: slot.sessionDate,
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          },
        },
      });
    } catch (err) {
      this.logger.warn(
        `Orphan session cleanup failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    // After bulk operations, perform a general perimeter cleanup:
    // Delete any SCHEDULED session (connected to a template) that falls OUTSIDE the class range.
    // This wipes out legacy "ghost" data if openingDate/closingDate was narrowed mid-way.
    try {
      await this.prisma.liveScheduleSession.deleteMany({
        where: {
          classId,
          status: 'SCHEDULED',
          scheduleId: { not: null },
          OR: [
            { sessionDate: { lt: classStart } },
            { sessionDate: { gt: classEnd } },
          ],
        },
      });
    } catch (err) {
      this.logger.error(
        `Perimeter cleanup failed for class ${classId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return { ok: true, upserted: ops.length };
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const schedule = await this.prisma.liveSchedule.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            status: true,
            liveSchedules: { select: { id: true } },
          },
        },
      },
    });
    if (!schedule) throw new NotFoundException('LiveSchedule not found');

    const { class: klass } = schedule;
    await this.assertTemplateMutable(schedule.classId);
    const isLastSchedule = klass.liveSchedules.length <= 1;
    const isActiveClass = ['OPENING', 'ONGOING'].includes(String(klass.status));
    if (isLastSchedule && isActiveClass) {
      throw new BadRequestException(
        'Cannot delete the last schedule of an active class. Cancel the class first.',
      );
    }

    await this.prisma.liveSchedule.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'live_schedule.delete',
      entity: 'LiveSchedule',
      entityId: id,
      description: `Deleted live schedule session ${id}`,
      metadata: { weekday: schedule.weekday, startTime: schedule.startTime },
    });

    return { ok: true };
  }

  async previewConflict(input: LiveScheduleConflictPreviewDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { instructorId: true, id: true },
    });
    if (!klass) {
      throw new BadRequestException('Invalid classId');
    }

    const sessionDate = new Date(input.sessionDate);
    if (Number.isNaN(sessionDate.getTime())) {
      throw new BadRequestException('Invalid sessionDate');
    }
    sessionDate.setUTCHours(0, 0, 0, 0);

    const inClassCandidates = await this.prisma.liveScheduleSession.findMany({
      where: {
        classId: input.classId,
        sessionDate,
        id: input.excludeSessionId
          ? { not: input.excludeSessionId }
          : undefined,
        status: { in: ['SCHEDULED'] },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        classId: true,
      },
    });
    const inClassConflicts = inClassCandidates.filter((candidate) =>
      this.isTimeOverlap(
        input.startTime,
        input.endTime,
        candidate.startTime,
        candidate.endTime,
      ),
    );

    let teacherConflicts: Array<{
      id: string;
      startTime: string;
      endTime: string;
      classId: string;
      classCode: string;
      className: string;
    }> = [];

    if (klass.instructorId) {
      const teacherCandidates = await this.prisma.liveScheduleSession.findMany({
        where: {
          sessionDate,
          id: input.excludeSessionId
            ? { not: input.excludeSessionId }
            : undefined,
          class: {
            instructorId: klass.instructorId,
            status: {
              in: ['DRAFT', 'PUBLISHED', 'OPENING', 'ONGOING'],
            },
          },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          class: { select: { id: true, code: true, name: true } },
        },
      });

      teacherConflicts = teacherCandidates
        .filter((c) => c.class.id !== input.classId)
        .filter((c) =>
          this.isTimeOverlap(
            input.startTime,
            input.endTime,
            c.startTime,
            c.endTime,
          ),
        )
        .map((c) => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.endTime,
          classId: c.class.id,
          classCode: c.class.code,
          className: c.class.name,
        }));
    }

    const conflict = { inClassConflicts, teacherConflicts };

    return {
      hasConflict:
        conflict.inClassConflicts.length > 0 ||
        conflict.teacherConflicts.length > 0,
      ...conflict,
    };
  }

  async findAllRequests(query: LiveScheduleRequestQueryDto) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
    const toDate = query.toDate ? new Date(query.toDate) : undefined;
    return this.prisma.liveScheduleRequest.findMany({
      where: {
        sessionId: query.sessionId,
        status: query.status as any,
        requestedBy: query.requestedBy,
        requestedDate:
          fromDate || toDate
            ? {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(toDate ? { lte: toDate } : {}),
              }
            : undefined,
      },
      include: {
        session: {
          select: {
            id: true,
            classId: true,
            startTime: true,
            endTime: true,
            sessionDate: true,
            class: {
              select: {
                id: true,
              },
            },
          },
        },
        requester: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async createRequest(
    input: LiveScheduleRequestCreateDto,
    requesterId: string,
  ) {
    const session = await this.prisma.liveScheduleSession.findUnique({
      where: { id: input.sessionId },
      include: {
        class: {
          select: {
            instructorId: true,
            id: true,
            name: true,
          },
        },
      },
    });
    if (!session) throw new NotFoundException('LiveScheduleSession not found');

    await this.assertCanCreateScheduleRequest(
      requesterId,
      session.class.instructorId,
    );

    const requestedDate = new Date(session.sessionDate);

    if (input.type === 'RESCHEDULE') {
      if (
        !input.proposedDate ||
        !input.proposedStartTime ||
        !input.proposedEndTime
      ) {
        throw new BadRequestException(
          'RESCHEDULE request must provide proposedDate, proposedStartTime, proposedEndTime',
        );
      }

      const preview = await this.previewConflict({
        classId: session.classId,
        sessionDate: input.proposedDate,
        startTime: input.proposedStartTime,
        endTime: input.proposedEndTime,
        excludeSessionId: input.sessionId,
      });
      if (preview.hasConflict) {
        throw new BadRequestException(
          'Proposed reschedule conflicts with existing class/teacher schedules',
        );
      }
    }

    const request = await this.prisma.liveScheduleRequest.create({
      data: {
        sessionId: input.sessionId,
        classId: session.classId,
        requestedBy: requesterId,
        type: input.type as any,
        status: 'PENDING' as any,
        reason: input.reason,
        requestedDate: requestedDate,
        originalWeekday: requestedDate.getDay(),
        originalStartTime: session.startTime,
        originalEndTime: session.endTime,
        proposedDate: input.proposedDate
          ? new Date(input.proposedDate)
          : undefined,
        proposedStartTime: input.proposedStartTime,
        proposedEndTime: input.proposedEndTime,
        proposedTeacherId: input.proposedTeacherId,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'live_schedule_request.create',
      entity: 'LiveScheduleRequest',
      entityId: request.id,
      description: `Created ${input.type} request for live session ${input.sessionId}`,
      metadata: {
        sessionId: input.sessionId,
        type: input.type,
        requestedDate: session.sessionDate,
      },
    });

    return request;
  }

  async cancelRequest(id: string, requesterId: string) {
    const request = await this.prisma.liveScheduleRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('LiveScheduleRequest not found');
    if (request.requestedBy !== requesterId) {
      throw new BadRequestException('Only requester can cancel this request');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING request can be cancelled');
    }

    const updated = await this.prisma.liveScheduleRequest.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'live_schedule_request.cancel',
      entity: 'LiveScheduleRequest',
      entityId: id,
      description: `Cancelled live schedule request ${id}`,
    });

    return updated;
  }

  async approveRequest(
    id: string,
    input: LiveScheduleRequestApproveDto,
    reviewerId: string,
  ) {
    const request = await this.prisma.liveScheduleRequest.findUnique({
      where: { id },
      include: {
        session: true,
      },
    });
    if (!request) throw new NotFoundException('LiveScheduleRequest not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING request can be approved');
    }

    if (request.type === 'RESCHEDULE') {
      if (
        !request.proposedDate ||
        !request.proposedStartTime ||
        !request.proposedEndTime
      ) {
        throw new BadRequestException(
          'RESCHEDULE request is missing proposed slot',
        );
      }
      const preview = await this.previewConflict({
        classId: request.session.classId,
        sessionDate: request.proposedDate.toISOString().slice(0, 10),
        startTime: request.proposedStartTime,
        endTime: request.proposedEndTime,
        excludeSessionId: request.sessionId,
      });
      if (preview.hasConflict) {
        throw new BadRequestException(
          'Reschedule request now conflicts with existing schedules',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (request.type === 'LEAVE') {
        await tx.liveScheduleSession.update({
          where: { id: request.sessionId },
          data: {
            status: 'CANCELLED',
            cancellationReason: request.reason ?? undefined,
          },
        });
      }

      if (request.type === 'RESCHEDULE') {
        const newRoomId = this.buildSessionRoomId();
        const newSession = await tx.liveScheduleSession.create({
          data: {
            classId: request.session.classId,
            scheduleId: null,
            sessionDate: request.proposedDate!,
            startTime: request.proposedStartTime!,
            endTime: request.proposedEndTime!,
            status: 'SCHEDULED',
            roomId: newRoomId,
            instructorId:
              request.proposedTeacherId ??
              request.session.instructorId ??
              undefined,
            createdBy: reviewerId,
            updatedBy: reviewerId,
          },
        });

        await tx.liveScheduleSession.update({
          where: { id: request.sessionId },
          data: {
            status: 'RESCHEDULED',
            supersededBySessionId: newSession.id,
          },
        });
      }

      await tx.liveScheduleRequest.update({
        where: { id },
        data: {
          status: 'APPROVED' as any,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNote: input.reviewNote,
        },
      });
    });

    await this.audit.log({
      userId: reviewerId,
      action: 'live_schedule_request.approve',
      entity: 'LiveScheduleRequest',
      entityId: id,
      description: `Approved live schedule request ${id}`,
      metadata: { reviewNote: input.reviewNote },
    });

    return this.prisma.liveScheduleRequest.findUnique({ where: { id } });
  }

  async rejectRequest(
    id: string,
    input: LiveScheduleRequestRejectDto,
    reviewerId: string,
  ) {
    const request = await this.prisma.liveScheduleRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('LiveScheduleRequest not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING request can be rejected');
    }

    const updated = await this.prisma.liveScheduleRequest.update({
      where: { id },
      data: {
        status: 'REJECTED' as any,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNote: input.reviewNote,
      },
    });

    await this.audit.log({
      userId: reviewerId,
      action: 'live_schedule_request.reject',
      entity: 'LiveScheduleRequest',
      entityId: id,
      description: `Rejected live schedule request ${id}`,
      metadata: { reviewNote: input.reviewNote },
    });

    return updated;
  }

  private getDefaultRoomInfo(
    roomId: string | null,
    roomTitle = 'Lớp học trực tuyến',
    extra?: {
      classId?: string;
      weekday?: number;
      startTime?: string;
    },
  ) {
    return {
      roomId: roomId,
      classId: extra?.classId,
      weekday: extra?.weekday,
      startTime: extra?.startTime,
      emptyTimeout: 60 * 60 * 2,
      metadata: create(RoomMetadataSchema, {
        roomTitle: roomTitle,
        welcomeMessage:
          'Welcome to walearnconnect!<br /> To share microphone click mic icon from bottom left side.',
        roomFeatures: create(RoomCreateFeaturesSchema, {
          allowWebcams: true,
          muteOnStart: false,
          allowScreenShare: true,
          allowRtmp: true,
          adminOnlyWebcams: false,
          allowViewOtherWebcams: true,
          allowViewOtherUsersList: true,
          roomDuration: '0',
          enableAnalytics: true,
          allowVirtualBg: true,
          allowRaiseHand: true,
          recordingFeatures: {
            isAllow: true,
            isAllowCloud: true,
            isAllowLocal: true,
            enableAutoCloudRecording: false,
            onlyRecordAdminWebcams: false,
          },
          chatFeatures: {
            isAllow: true,
            isAllowFileUpload: true,
            maxFileSize: '50',
            allowedFileTypes: ['jpg', 'png', 'zip', 'pdf'],
          },
          whiteboardFeatures: {
            isAllow: true,
          },
          externalMediaPlayerFeatures: {
            isAllow: true,
          },
          waitingRoomFeatures: {
            isActive: true,
          },
          breakoutRoomFeatures: {
            isAllow: true,
            allowedNumberRooms: 6,
          },
          displayExternalLinkFeatures: {
            isAllow: true,
          },
          ingressFeatures: {
            isAllow: true,
          },
          pollsFeatures: {
            isAllow: true,
          },
          insightsFeatures: {
            isAllow: true,
            transcriptionFeatures: {
              isAllow: true,
              isAllowTranslation: true,
              isAllowSpeechSynthesis: true,
            },
            chatTranslationFeatures: {
              isAllow: true,
            },
            aiFeatures: {
              isAllow: true,
              aiTextChatFeatures: {
                isAllow: true,
              },
              meetingSummarizationFeatures: {
                isAllow: true,
              },
            },
          },
          endToEndEncryptionFeatures: {
            isEnabled: false,
            includedChatMessages: false,
            includedWhiteboard: false,
            enabledSelfInsertEncryptionKey: false,
          },
        }),
      }),
    };
  }

  private assertClassJoinable(classStatus: string) {
    if (classStatus !== 'OPENING' && classStatus !== 'ONGOING') {
      throw new BadRequestException(
        'Class is not available for live sessions in current status.',
      );
    }
  }

  private assertInJoinWindow(
    schedule: {
      weekday: number;
      startTime: string;
      endTime: string;
    },
    isAdmin: boolean,
  ) {
    // Dev-only bypass to help testing room activation/joins.
    // Enable by setting env: DISABLE_LIVE_SESSION_JOIN_WINDOW=true
    if (
      isAdmin &&
      process.env.DISABLE_LIVE_SESSION_JOIN_WINDOW === 'true' &&
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }
    const now = new Date();

    const [startHour, startMinute] = this.parseHourMinute(schedule.startTime);
    const [endHour, endMinute] = this.parseHourMinute(schedule.endTime);
    const expectedWeekday = schedule.weekday;
    if (now.getDay() !== expectedWeekday) {
      throw new BadRequestException(
        'Session is not available on this weekday.',
      );
    }

    const sessionStart = new Date(now);
    sessionStart.setHours(startHour, startMinute, 0, 0);
    const sessionEnd = new Date(now);
    sessionEnd.setHours(endHour, endMinute, 0, 0);

    const joinOpenAt = new Date(sessionStart.getTime() - 30 * 60 * 1000);
    const joinCloseAt = new Date(sessionEnd.getTime() + 4 * 60 * 60 * 1000);
    if (now < joinOpenAt || now > joinCloseAt) {
      throw new BadRequestException(
        'Session join window is closed. You can join 30 minutes before start and up to 4 hours after end.',
      );
    }
  }

  private assertInJoinWindowForSession(
    input: {
      sessionDate: Date;
      startTime: string;
      endTime: string;
    },
    isAdmin: boolean,
  ) {
    if (
      isAdmin &&
      process.env.DISABLE_LIVE_SESSION_JOIN_WINDOW === 'true' &&
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    const now = new Date();
    const sessionDate = new Date(input.sessionDate);
    sessionDate.setHours(0, 0, 0, 0);

    const [startHour, startMinute] = this.parseHourMinute(input.startTime);
    const [endHour, endMinute] = this.parseHourMinute(input.endTime);

    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHour, startMinute, 0, 0);
    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHour, endMinute, 0, 0);

    const joinOpenAt = new Date(sessionStart.getTime() - 30 * 60 * 1000);
    const joinCloseAt = new Date(sessionEnd.getTime() + 4 * 60 * 60 * 1000);
    if (now < joinOpenAt || now > joinCloseAt) {
      throw new BadRequestException(
        'Session join window is closed. You can join 30 minutes before start and up to 4 hours after end.',
      );
    }
  }

  private async ensureSessionRoomId(
    sessionId: string,
    existingRoomId: string | null,
  ) {
    if (existingRoomId?.trim()) return existingRoomId.trim();
    const roomId = this.buildSessionRoomId();
    await this.prisma.liveScheduleSession.update({
      where: { id: sessionId },
      data: { roomId },
    });
    return roomId;
  }

  private parseHourMinute(time: string) {
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
    return [hour, minute] as const;
  }

  private startOfDay(d: Date) {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
  }

  private addDays(d: Date, days: number) {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + days);
    return x;
  }

  private isTimeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ) {
    const [aStartHour, aStartMinute] = this.parseHourMinute(startA);
    const [aEndHour, aEndMinute] = this.parseHourMinute(endA);
    const [bStartHour, bStartMinute] = this.parseHourMinute(startB);
    const [bEndHour, bEndMinute] = this.parseHourMinute(endB);

    const aStart = aStartHour * 60 + aStartMinute;
    const aEnd = aEndHour * 60 + aEndMinute;
    const bStart = bStartHour * 60 + bStartMinute;
    const bEnd = bEndHour * 60 + bEndMinute;
    if (aEnd <= aStart || bEnd <= bStart) {
      throw new BadRequestException('endTime must be greater than startTime');
    }
    return aStart < bEnd && bStart < aEnd;
  }

  private async assertNoScheduleConflicts(input: {
    classId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    instructorId?: string | null;
    excludeScheduleId?: string;
  }) {
    const conflict = await this.checkScheduleConflicts(input);
    if (conflict.inClassConflicts.length > 0) {
      throw new BadRequestException(
        'Schedule conflicts with existing slot in this class',
      );
    }
    if (conflict.teacherConflicts.length > 0) {
      throw new BadRequestException(
        'Primary teacher has a conflicting schedule in another live class',
      );
    }
  }

  private async checkScheduleConflicts(input: {
    classId: string;
    weekday: number;
    startTime: string;
    endTime: string;
    instructorId?: string | null;
    excludeScheduleId?: string;
  }) {
    const inClassCandidates = await this.prisma.liveSchedule.findMany({
      where: {
        classId: input.classId,
        weekday: input.weekday,
        id: input.excludeScheduleId
          ? { not: input.excludeScheduleId }
          : undefined,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        classId: true,
      },
    });

    const inClassConflicts = inClassCandidates.filter((candidate) =>
      this.isTimeOverlap(
        input.startTime,
        input.endTime,
        candidate.startTime,
        candidate.endTime,
      ),
    );

    let teacherConflicts: Array<{
      id: string;
      startTime: string;
      endTime: string;
      classId: string;
      classCode: string;
      className: string;
    }> = [];
    if (input.instructorId) {
      const teacherCandidates = await this.prisma.liveSchedule.findMany({
        where: {
          weekday: input.weekday,
          id: input.excludeScheduleId
            ? { not: input.excludeScheduleId }
            : undefined,
          class: {
            instructorId: input.instructorId,
            status: {
              in: ['DRAFT', 'PUBLISHED', 'OPENING', 'ONGOING'],
            },
          },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          class: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      });

      teacherConflicts = teacherCandidates
        .filter(
          (candidate) => !input.classId || candidate.class.id !== input.classId,
        )
        .filter((candidate) =>
          this.isTimeOverlap(
            input.startTime,
            input.endTime,
            candidate.startTime,
            candidate.endTime,
          ),
        )
        .map((candidate) => ({
          id: candidate.id,
          startTime: candidate.startTime,
          endTime: candidate.endTime,
          classId: candidate.class.id,
          classCode: candidate.class.code,
          className: candidate.class.name,
        }));
    }

    return {
      inClassConflicts,
      teacherConflicts,
    };
  }

  private async assertCanCreateScheduleRequest(
    requesterId: string,
    instructorId?: string | null,
  ) {
    const user = await this.getUserById(requesterId);
    const role = String(user?.role || '').toLowerCase();
    const isStaffOrAdmin = ['admin', 'staff', 'staff-lms'].includes(role);
    const isPrimaryTeacher = instructorId === requesterId;
    if (!isStaffOrAdmin && !isPrimaryTeacher) {
      throw new BadRequestException(
        'Only primary teacher or staff/admin can create schedule requests',
      );
    }
  }

  private async assertJoinPermission(
    schedule: {
      classId: string;
      class: {
        instructorId?: string | null;
      };
    },
    userId: string,
    isAdmin: boolean,
    userRole?: string,
  ) {
    if (isAdmin) {
      const isPrimaryTeacher = schedule.class.instructorId === userId;
      const isAdminOverride = ['admin', 'staff', 'staff-lms'].includes(
        (userRole || '').toLowerCase(),
      );
      if (!isPrimaryTeacher && !isAdminOverride) {
        throw new BadRequestException(
          'Only assigned lecturer or admin/staff can start this live room.',
        );
      }
      return;
    }

    const activeEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        classId: schedule.classId,
        userId,
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    if (!activeEnrollment) {
      throw new BadRequestException(
        'You are not actively enrolled in this class.',
      );
    }
  }

  private async getUserById(userId: string) {
    const userRes = await firstValueFrom(
      this.nats.send({ cmd: 'identity.users.findById' }, { id: userId }),
    ).catch(() => null);
    return userRes?.user;
  }

  private async ensureScheduleRoomId(
    scheduleId: string,
    roomId: string | null,
    classId: string,
  ) {
    if (roomId?.trim()) {
      return roomId;
    }

    const generatedRoomId = this.buildSessionRoomId();
    await this.prisma.liveSchedule.update({
      where: { id: scheduleId },
      data: { roomId: generatedRoomId },
    });
    return generatedRoomId;
  }

  private async sendNatsWithRetry(
    pattern: Record<string, string>,
    payload: unknown,
    retries = 2,
    delayMs = 200,
  ) {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await firstValueFrom(this.nats.send(pattern, payload));
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    throw lastError;
  }
}
