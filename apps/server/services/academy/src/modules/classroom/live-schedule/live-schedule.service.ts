import { BadRequestException, Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  LiveScheduleCreateDto,
  LiveScheduleQueryDto,
  LiveScheduleUpdateDto,
} from './dto/live-schedule.dto';
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
  ) { }

  async findAll(query: LiveScheduleQueryDto) {
    return this.prisma.liveSchedule.findMany({
      where: { liveClassId: query.liveClassId ?? undefined },
      orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }, { id: 'asc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.liveSchedule.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('LiveSchedule not found');
    return item;
  }

  async create(input: LiveScheduleCreateDto, requesterId = 'SYSTEM') {
    const liveKlass = await this.prisma.liveClass.findUnique({
      where: { id: input.liveClassId },
      include: { class: true },
    });
    if (!liveKlass) throw new BadRequestException('Invalid liveClassId');

    const roomId = `live-${liveKlass.classId.substring(0, 8)}-${Date.now()}`;

    const schedule = await this.prisma.liveSchedule.create({
      data: {
        liveClassId: input.liveClassId,
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
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
          },
        },
      },
    });

    if (!schedule) throw new NotFoundException('Session not found');

    // 1. Check if room exists in Meet Service, if not create it JIT
    const roomExists = await firstValueFrom(
      this.nats.send({ cmd: 'room.isRoomActive' }, { roomId: schedule.roomId }),
    ).catch(() => ({ status: false }));

    if (!roomExists?.status) {
      if (!isAdmin) {
        throw new BadRequestException('Phòng học chưa được khởi tạo bởi giảng viên.');
      }

      if (!schedule.roomId) {
        throw new BadRequestException('Room ID is missing for this session.');
      }

      const roomTitle =
        schedule.liveClass.class.courseProfile?.title || schedule.liveClass.class.name;
      const roomInfo = this.getDefaultRoomInfo(schedule.roomId, roomTitle);

      await firstValueFrom(this.nats.send({ cmd: 'room.create' }, roomInfo)).catch((err) => {
        this.logger.error(`Failed to create room ${schedule.roomId} for live class ${schedule.liveClassId}: ${err instanceof Error ? err.message : err}`);
        throw new BadRequestException('Không thể khởi tạo phòng học. Vui lòng thử lại.');
      });
    }

    // 2. Get User Info from Identity Service to include avatar
    const userRes = await firstValueFrom(
      this.nats.send({ cmd: 'identity.users.findById' }, { id: userId }),
    ).catch(() => null);

    const user = userRes?.user;

    // 3. Generate Join Token with Metadata
    const joinReq = create(GenerateTokenReqSchema, {
      roomId: schedule.roomId ?? '',
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

    const tokenRes = await firstValueFrom(
      this.nats.send({ cmd: 'user.generateJoinToken' }, joinReq),
    );

    return {
      token: tokenRes.token,
      roomId: schedule.roomId,
      userId: userId,
      roomTitle: schedule.liveClass.class.courseProfile?.title || schedule.liveClass.class.name,
    };
  }

  async update(id: string, input: LiveScheduleUpdateDto, requesterId = 'SYSTEM') {
    const oldSchedule = await this.findById(id);
    const updated = await this.prisma.liveSchedule.update({
      where: { id },
      data: {
        weekday: input.weekday,
        startTime: input.startTime,
        endTime: input.endTime,
        location: input.location,
        note: input.note,
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
    const schedule = await this.findById(id);
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
}
