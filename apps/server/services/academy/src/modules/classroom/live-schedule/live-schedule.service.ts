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

  async findAll(query: LiveScheduleQueryDto) {
    return this.prisma.liveSchedule.findMany({
      where: { liveClassId: query.liveClassId ?? undefined },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
      include: {
        liveClass: {
          select: {
            classId: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.liveSchedule.findUnique({
      where: { id },
      include: {
        liveClass: {
          select: {
            classId: true,
          },
        },
      },
    });
    if (!item) throw new NotFoundException('LiveSchedule not found');
    return item;
  }

  async create(input: LiveScheduleCreateDto, requesterId = 'SYSTEM') {
    const liveKlass = await this.prisma.liveClass.findUnique({
      where: { id: input.liveClassId },
      include: { class: true },
    });
    if (!liveKlass) throw new BadRequestException('Invalid liveClassId');
    await this.assertNoScheduleConflicts({
      liveClassId: input.liveClassId,
      classId: liveKlass.classId,
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      primaryTeacherId: liveKlass.primaryTeacherId,
    });

    const roomId = input.roomId?.trim()
      ? input.roomId.trim()
      : `live-${liveKlass.classId.substring(0, 8)}-${Date.now()}`;

    const schedule = await this.prisma.liveSchedule.create({
      data: {
        liveClassId: input.liveClassId,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        excludedDates: input.excludedDates ?? undefined,
        note: input.note,
        roomId: roomId,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'live_schedule.create',
      entity: 'LiveSchedule',
      entityId: schedule.id,
      description: `Created live schedule for class: ${liveKlass.class.name}`,
      newValues: {
        liveClassId: schedule.liveClassId,
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
        liveClass: {
          include: {
            class: {
              include: {
                courseProfile: { select: { title: true } },
              },
            },
            primaryTeacher: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!schedule) throw new NotFoundException('Session not found');

    this.assertClassJoinable(schedule.liveClass.class.status);
    this.assertInJoinWindow(schedule);

    const user = await this.getUserById(userId);
    await this.assertJoinPermission(schedule, userId, isAdmin, user?.role);
    const roomId = await this.ensureScheduleRoomId(schedule.id, schedule.roomId, schedule.liveClass.classId);

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
        throw new BadRequestException('Phòng học chưa được giảng viên khởi tạo.');
      }

      const roomTitle =
        schedule.liveClass.class.courseProfile?.title ||
        schedule.liveClass.class.name;
      const roomInfo = this.getDefaultRoomInfo(roomId, roomTitle);

      await this.sendNatsWithRetry({ cmd: 'room.create' }, roomInfo, 2).catch(
        (err) => {
          this.logger.error(
            `Failed to create room ${roomId} for live class ${schedule.liveClassId}: ${
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
        metadata: { roomId, liveClassId: schedule.liveClassId },
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
        liveClassId: schedule.liveClassId,
        classId: schedule.liveClass.classId,
        role: isAdmin ? 'lecturer' : 'student',
      },
    });

    return {
      token: tokenRes.token,
      roomId,
      userId: userId,
      roomTitle:
        schedule.liveClass.class.courseProfile?.title ||
        schedule.liveClass.class.name,
    };
  }

  async update(id: string, input: LiveScheduleUpdateDto, requesterId = 'SYSTEM') {
    const oldSchedule = await this.findById(id);
    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: oldSchedule.liveClassId },
      select: { primaryTeacherId: true, classId: true },
    });
    await this.assertNoScheduleConflicts({
      liveClassId: oldSchedule.liveClassId,
      classId: liveClass?.classId,
      weekday: input.weekday ?? oldSchedule.weekday,
      startTime: input.startTime ?? oldSchedule.startTime,
      endTime: input.endTime ?? oldSchedule.endTime,
      primaryTeacherId: liveClass?.primaryTeacherId,
      excludeScheduleId: id,
    });

    const updated = await this.prisma.liveSchedule.update({
      where: { id },
      data: {
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        excludedDates: input.excludedDates ?? undefined,
        note: input.note,
        roomId: input.roomId,
      },
    });

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

  async delete(id: string, requesterId = 'SYSTEM') {
    const schedule = await this.prisma.liveSchedule.findUnique({
      where: { id },
      include: {
        liveClass: {
          include: {
            class: { select: { status: true } },
            schedules: { select: { id: true } },
          },
        },
      },
    });
    if (!schedule) throw new NotFoundException('LiveSchedule not found');

    const { liveClass } = schedule;
    const isLastSchedule = liveClass.schedules.length <= 1;
    const isActiveClass = ['ENROLLING', 'IN_PROGRESS'].includes(liveClass.class.status);
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
    const liveClass = await this.prisma.liveClass.findUnique({
      where: { id: input.liveClassId },
      select: { primaryTeacherId: true, classId: true },
    });
    if (!liveClass) {
      throw new BadRequestException('Invalid liveClassId');
    }

    const conflict = await this.checkScheduleConflicts({
      liveClassId: input.liveClassId,
      classId: liveClass.classId,
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      primaryTeacherId: liveClass.primaryTeacherId,
      excludeScheduleId: input.excludeScheduleId,
    });

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
        liveScheduleId: query.liveScheduleId,
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
        liveSchedule: {
          select: {
            id: true,
            liveClassId: true,
            weekday: true,
            startTime: true,
            endTime: true,
            liveClass: {
              select: {
                classId: true,
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

  async createRequest(input: LiveScheduleRequestCreateDto, requesterId: string) {
    const schedule = await this.prisma.liveSchedule.findUnique({
      where: { id: input.liveScheduleId },
      include: {
        liveClass: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!schedule) throw new NotFoundException('LiveSchedule not found');

    await this.assertCanCreateScheduleRequest(
      requesterId,
      schedule.liveClass.primaryTeacherId,
    );

    const requestedDate = new Date(input.requestedDate);
    if (Number.isNaN(requestedDate.getTime())) {
      throw new BadRequestException('Invalid requestedDate');
    }

    if (input.type === 'RESCHEDULE') {
      if (!input.proposedDate || !input.proposedStartTime || !input.proposedEndTime) {
        throw new BadRequestException(
          'RESCHEDULE request must provide proposedDate, proposedStartTime, proposedEndTime',
        );
      }

      const preview = await this.previewConflict({
        liveClassId: schedule.liveClassId,
        weekday: new Date(input.proposedDate).getDay(),
        startTime: input.proposedStartTime,
        endTime: input.proposedEndTime,
      });
      if (preview.hasConflict) {
        throw new BadRequestException(
          'Proposed reschedule conflicts with existing class/teacher schedules',
        );
      }
    }

    const request = await this.prisma.liveScheduleRequest.create({
      data: {
        liveScheduleId: input.liveScheduleId,
        requestedBy: requesterId,
        type: input.type as any,
        status: 'PENDING' as any,
        reason: input.reason,
        requestedDate,
        originalWeekday: schedule.weekday,
        originalStartTime: schedule.startTime,
        originalEndTime: schedule.endTime,
        proposedDate: input.proposedDate ? new Date(input.proposedDate) : undefined,
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
      description: `Created ${input.type} request for live schedule ${input.liveScheduleId}`,
      metadata: {
        liveScheduleId: input.liveScheduleId,
        type: input.type,
        requestedDate: input.requestedDate,
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
        liveSchedule: true,
      },
    });
    if (!request) throw new NotFoundException('LiveScheduleRequest not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING request can be approved');
    }

    if (request.type === 'RESCHEDULE') {
      if (!request.proposedDate || !request.proposedStartTime || !request.proposedEndTime) {
        throw new BadRequestException('RESCHEDULE request is missing proposed slot');
      }
      const preview = await this.previewConflict({
        liveClassId: request.liveSchedule.liveClassId,
        weekday: request.proposedDate.getDay(),
        startTime: request.proposedStartTime,
        endTime: request.proposedEndTime,
      });
      if (preview.hasConflict) {
        throw new BadRequestException(
          'Reschedule request now conflicts with existing schedules',
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      const currentExcluded = Array.isArray(request.liveSchedule.excludedDates)
        ? (request.liveSchedule.excludedDates as string[])
        : [];
      const requestDate = request.requestedDate.toISOString().slice(0, 10);
      const nextExcluded = currentExcluded.includes(requestDate)
        ? currentExcluded
        : [...currentExcluded, requestDate];

      const metadata: Record<string, unknown> = {
        ...(request.metadata as Record<string, unknown>),
      };
      if (request.type === 'RESCHEDULE') {
        metadata.reschedule = {
          requestedDate: requestDate,
          proposedDate: request.proposedDate?.toISOString(),
          proposedStartTime: request.proposedStartTime,
          proposedEndTime: request.proposedEndTime,
          proposedTeacherId: request.proposedTeacherId,
        };
      }

      await tx.liveSchedule.update({
        where: { id: request.liveScheduleId },
        data: {
          excludedDates: nextExcluded,
        },
      });

      await tx.liveScheduleRequest.update({
        where: { id },
        data: {
          status: 'APPROVED' as any,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          reviewNote: input.reviewNote,
          metadata: metadata as any,
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

  private getDefaultRoomInfo(roomId: string | null, roomTitle = 'Lớp học trực tuyến') {
    return {
      roomId: roomId,
      emptyTimeout: 60 * 60 * 2,
      metadata: create(RoomMetadataSchema, {
        roomTitle: roomTitle,
        welcomeMessage: 'Welcome to walearnconnect!<br /> To share microphone click mic icon from bottom left side.',
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
              }
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
    }
  }

  private assertClassJoinable(classStatus: string) {
    if (classStatus !== 'ENROLLING' && classStatus !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Class is not available for live sessions in current status.',
      );
    }
  }

  private assertInJoinWindow(schedule: {
    weekday: number;
    startTime: string;
    endTime: string;
    liveClass: { startDate: Date; endDate: Date };
  }) {
    const now = new Date();
    const classStart = new Date(schedule.liveClass.startDate);
    const classEnd = new Date(schedule.liveClass.endDate);
    if (now < classStart || now > classEnd) {
      throw new BadRequestException(
        'Session is outside the class active date range.',
      );
    }

    const [startHour, startMinute] = this.parseHourMinute(schedule.startTime);
    const [endHour, endMinute] = this.parseHourMinute(schedule.endTime);
    const expectedWeekday = schedule.weekday;
    if (now.getDay() !== expectedWeekday) {
      throw new BadRequestException('Session is not available on this weekday.');
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
    liveClassId: string;
    classId?: string;
    weekday: number;
    startTime: string;
    endTime: string;
    primaryTeacherId?: string | null;
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
    liveClassId: string;
    classId?: string;
    weekday: number;
    startTime: string;
    endTime: string;
    primaryTeacherId?: string | null;
    excludeScheduleId?: string;
  }) {
    const inClassCandidates = await this.prisma.liveSchedule.findMany({
      where: {
        liveClassId: input.liveClassId,
        weekday: input.weekday,
        id: input.excludeScheduleId
          ? { not: input.excludeScheduleId }
          : undefined,
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        liveClassId: true,
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
    if (input.primaryTeacherId) {
      const teacherCandidates = await this.prisma.liveSchedule.findMany({
        where: {
          weekday: input.weekday,
          id: input.excludeScheduleId
            ? { not: input.excludeScheduleId }
            : undefined,
          liveClass: {
            primaryTeacherId: input.primaryTeacherId,
            class: {
              status: {
                in: ['DRAFT', 'PENDING_APPROVAL', 'ENROLLING', 'IN_PROGRESS'],
              },
            },
          },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          liveClass: {
            select: {
              classId: true,
              class: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      teacherConflicts = teacherCandidates
        .filter(
          (candidate) =>
            !input.classId || candidate.liveClass.classId !== input.classId,
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
          classId: candidate.liveClass.classId,
          classCode: candidate.liveClass.class.code,
          className: candidate.liveClass.class.name,
        }));
    }

    return {
      inClassConflicts,
      teacherConflicts,
    };
  }

  private async assertCanCreateScheduleRequest(
    requesterId: string,
    primaryTeacherId?: string | null,
  ) {
    const user = await this.getUserById(requesterId);
    const role = String(user?.role || '').toLowerCase();
    const isStaffOrAdmin = ['admin', 'staff', 'staff-lms'].includes(role);
    const isPrimaryTeacher = primaryTeacherId === requesterId;
    if (!isStaffOrAdmin && !isPrimaryTeacher) {
      throw new BadRequestException(
        'Only primary teacher or staff/admin can create schedule requests',
      );
    }
  }

  private async assertJoinPermission(
    schedule: {
      liveClassId: string;
      liveClass: {
        classId: string;
        primaryTeacherId?: string | null;
      };
    },
    userId: string,
    isAdmin: boolean,
    userRole?: string,
  ) {
    if (isAdmin) {
      const isPrimaryTeacher = schedule.liveClass.primaryTeacherId === userId;
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
        classId: schedule.liveClass.classId,
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

    const generatedRoomId = `live-${classId.substring(0, 8)}-${Date.now()}`;
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
