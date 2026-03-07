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
import {
  CreateRoomReqSchema,
  RoomMetadataSchema,
  RoomCreateFeaturesSchema,
  GenerateTokenReqSchema,
  UserInfoSchema,
  UserMetadataSchema,
  NatsSubjectsSchema,
} from '@workspace/protocol';
import { AppConfigService } from '@server/shared';

@Injectable()
export class ClassScheduleService {
  private readonly logger = new Logger(ClassScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfig: AppConfigService,
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

  async join(id: string, userId: string, isAdmin = false) {
    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            courseProfile: { select: { title: true } },
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
      // If student joins and room does not exist, throw error or wait? 
      // Usually, lecturer must start the room first, or we allow first person to trigger creation.
      // Based on your requirement: Lecturer (admin) may need to check it, for learner maybe not.
      // We will allow lecturer to create it.
      if (!isAdmin) {
        throw new BadRequestException('Phòng học chưa được khởi tạo bởi giảng viên.');
      }

      if (!schedule.roomId) {
        throw new BadRequestException('Room ID is missing for this session.');
      }

      const roomTitle =
        schedule.class.courseProfile?.title || schedule.class.name;
      const roomInfo = this.getDefaultRoomInfo(schedule.roomId, roomTitle);

      await firstValueFrom(this.nats.send({ cmd: 'room.create' }, roomInfo)).catch((err) => {
        this.logger.error(`Failed to create room ${schedule.roomId} for class ${schedule.classId}: ${err instanceof Error ? err.message : err}`);
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
      roomTitle: schedule.class.courseProfile?.title || schedule.class.name,
    };
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

