import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import {
    LiveSessionCreateDTO,
    LiveSessionResponseDTO,
    LiveSessionUpdateDTO,
    Requester,
    UserRole,
    LiveSessionStatus,
    LiveSessionJoinResponseDTO,
    LiveSessionBulkCreateDTO,
} from '@workspace/schemas';
import type { LiveSession } from '@prisma/generated';
import { create } from '@bufbuild/protobuf';
import {
    CreateRoomReqSchema,
    RoomMetadataSchema,
    RoomCreateFeaturesSchema,
    RecordingFeaturesSchema,
    ChatFeaturesSchema,
    WhiteboardFeaturesSchema,
    ExternalMediaPlayerFeaturesSchema,
    WaitingRoomFeaturesSchema,
    BreakoutRoomFeaturesSchema,
    DisplayExternalLinkFeaturesSchema,
    IngressFeaturesSchema,
    PollsFeaturesSchema,
    InsightsFeaturesSchema,
    InsightsTranscriptionFeaturesSchema,
    InsightsChatTranslationFeaturesSchema,
    InsightsAIFeaturesSchema,
    InsightsAITextChatFeaturesSchema,
    InsightsAIMeetingSummarizationFeaturesSchema,
} from '@workspace/protocol';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ILiveSessionService } from '@server/learning/interfaces/services/i-live-session.service';
import {
    ILiveSessionRepository,
    LIVE_SESSION_REPOSITORY_TOKEN,
    COURSE_MASTER_REPOSITORY_TOKEN,
    ICourseMasterRepository,
    ICourseRunRepository,
    COURSE_RUN_REPOSITORY_TOKEN,
} from '@server/learning/interfaces/repositories';
import { PrismaService } from '@server/shared';

@Injectable()
export class LiveSessionService implements ILiveSessionService {
    private readonly logger = new Logger(LiveSessionService.name);

    constructor(
        @Inject(LIVE_SESSION_REPOSITORY_TOKEN)
        private readonly liveSessionRepository: ILiveSessionRepository,
        @Inject(COURSE_MASTER_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseMasterRepository,
        @Inject(COURSE_RUN_REPOSITORY_TOKEN)
        private readonly courseRunRepository: ICourseRunRepository,
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    /**
     * Helper to check if requester has a specific permission
     */
    private hasPermission(requester: Requester, permission: string): boolean {
        if (!requester.permissions) return false;
        return requester.permissions.includes('*') || requester.permissions.includes(permission);
    }

    async findById(id: string): Promise<LiveSessionResponseDTO> {
        const session = await this.liveSessionRepository.findById(id);
        if (!session) {
            throw new NotFoundException(`Live session with id ${id} not found`);
        }
        return this.mapper.map<any, LiveSessionResponseDTO>(session, 'LiveSession', 'LiveSessionResponseDTO');
    }

    async findByRunId(courseRunId: string): Promise<LiveSessionResponseDTO[]> {
        const sessions = await this.liveSessionRepository.findByRunId(courseRunId);
        return sessions.map((s) => this.mapper.map<any, LiveSessionResponseDTO>(s, 'LiveSession', 'LiveSessionResponseDTO'));
    }

    async bulkCreate(requester: Requester, dto: LiveSessionBulkCreateDTO): Promise<LiveSessionResponseDTO[]> {
        // Only authorized users can schedule live sessions
        if (!this.hasPermission(requester, 'live_class.schedule')) {
            throw new ForbiddenException('Only authorized staff can schedule live sessions');
        }

        const run = await this.courseRunRepository.findById(dto.courseRunId);
        if (!run) {
            throw new NotFoundException(`CourseRun with id ${dto.courseRunId} not found`);
        }

        const course = await this.courseRepository.findById(run.courseMasterId);
        if (!course) {
            throw new NotFoundException(`Course with id ${run.courseMasterId} not found`);
        }

        if (course.type !== 'live') {
            throw new BadRequestException('Live sessions can only be scheduled for live course runs');
        }

        const createdSessions: LiveSession[] = [];

        for (let i = 0; i < dto.dates.length; i++) {
            const date = new Date(dto.dates[i]);
            const title = `${dto.titlePrefix} - Buổi ${i + 1}`;

            const session = await this.liveSessionRepository.create({
                courseRun: { connect: { id: dto.courseRunId } },
                title: title,
                description: dto.description,
                scheduledAt: date,
                duration: dto.duration,
                lecturerId: dto.lecturerId,
            });
            createdSessions.push(session);
        }

        return createdSessions.map((s) => this.mapper.map<any, LiveSessionResponseDTO>(s, 'LiveSession', 'LiveSessionResponseDTO'));
    }

    async create(requester: Requester, dto: LiveSessionCreateDTO): Promise<LiveSessionResponseDTO> {
        // Only authorized users can create live sessions
        if (!this.hasPermission(requester, 'live_class.schedule')) {
            throw new ForbiddenException('Only authorized staff can schedule live sessions');
        }

        const run = await this.courseRunRepository.findById(dto.courseRunId);
        if (!run) {
            throw new NotFoundException(`CourseRun with id ${dto.courseRunId} not found`);
        }

        const course = await this.courseRepository.findById(run.courseMasterId);
        if (!course || course.type !== 'live') {
            throw new BadRequestException('Live sessions can only be created for live course runs');
        }

        const session = await this.liveSessionRepository.create({
            courseRun: { connect: { id: dto.courseRunId } },
            title: dto.title,
            description: dto.description,
            scheduledAt: new Date(dto.scheduledAt),
            duration: dto.duration,
            lecturerId: dto.lecturerId,
        });

        return this.mapper.map<any, LiveSessionResponseDTO>(session, 'LiveSession', 'LiveSessionResponseDTO');
    }

    async update(requester: Requester, id: string, dto: LiveSessionUpdateDTO): Promise<LiveSessionResponseDTO> {
        // Only authorized users can update live sessions
        if (!this.hasPermission(requester, 'live_class.schedule')) {
            throw new ForbiddenException('Only authorized staff can update live sessions');
        }

        const existing = await this.liveSessionRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Live session with id ${id} not found`);
        }

        const updateData: any = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.scheduledAt !== undefined) updateData.scheduledAt = new Date(dto.scheduledAt);
        if (dto.duration !== undefined) updateData.duration = dto.duration;
        if (dto.lecturerId !== undefined) updateData.lecturerId = dto.lecturerId;
        if (dto.status !== undefined) updateData.status = dto.status;
        if (dto.meetingId !== undefined) updateData.meetingId = dto.meetingId;

        const updated = await this.liveSessionRepository.update(id, updateData);
        return this.mapper.map<any, LiveSessionResponseDTO>(updated, 'LiveSession', 'LiveSessionResponseDTO');
    }

    async delete(requester: Requester, id: string): Promise<{ message: string }> {
        // Only authorized users can delete live sessions
        if (!this.hasPermission(requester, 'live_class.schedule')) {
            throw new ForbiddenException('Only authorized staff can delete live sessions');
        }

        const existing = await this.liveSessionRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Live session with id ${id} not found`);
        }

        await this.liveSessionRepository.delete(id);
        return { message: 'Live session deleted successfully' };
    }

    async startSession(requester: Requester, id: string): Promise<LiveSessionResponseDTO> {
        const existing = await this.liveSessionRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Live session with id ${id} not found`);
        }

        // Only Admin, Staff (manage), or the assigned Lecturer can start the session
        const isAssigned = existing.lecturerId === requester.sub;
        const hasManagePermission = this.hasPermission(requester, 'live_class.manage');

        if (!isAssigned && !hasManagePermission && requester.role !== 'admin') {
            throw new ForbiddenException('You are not authorized to start this session');
        }

        // Create a room in Meet module if it doesn't exist
        // meetingId is now generated lazily when the session starts
        const roomId = existing.meetingId || `live-${id.substring(0, 8)}`;
        try {
            const createRoomReq = create(CreateRoomReqSchema, {
                roomId: roomId,
                metadata: create(RoomMetadataSchema, {
                    roomTitle: existing.title,
                    welcomeMessage: `Chào mừng bạn đến với buổi học trực tuyến: <b>${existing.title}</b>.<br /> Vui lòng kiểm tra Microphone và Camera trước khi bắt đầu.`,
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
                        recordingFeatures: create(RecordingFeaturesSchema, {
                            isAllow: true,
                            isAllowCloud: true,
                            isAllowLocal: true,
                            enableAutoCloudRecording: false,
                            onlyRecordAdminWebcams: false,
                        }),
                        chatFeatures: create(ChatFeaturesSchema, {
                            isAllow: true,
                            isAllowFileUpload: true,
                            maxFileSize: '50',
                            allowedFileTypes: ['jpg', 'png', 'zip', 'pdf'],
                        }),
                        whiteboardFeatures: create(WhiteboardFeaturesSchema, {
                            isAllow: true,
                        }),
                        externalMediaPlayerFeatures: create(ExternalMediaPlayerFeaturesSchema, {
                            isAllow: true,
                        }),
                        waitingRoomFeatures: create(WaitingRoomFeaturesSchema, {
                            isActive: true,
                        }),
                        breakoutRoomFeatures: create(BreakoutRoomFeaturesSchema, {
                            isAllow: true,
                            allowedNumberRooms: 6,
                        }),
                        displayExternalLinkFeatures: create(DisplayExternalLinkFeaturesSchema, {
                            isAllow: true,
                        }),
                        ingressFeatures: create(IngressFeaturesSchema, {
                            isAllow: true,
                        }),
                        pollsFeatures: create(PollsFeaturesSchema, {
                            isAllow: true,
                        }),
                        insightsFeatures: create(InsightsFeaturesSchema, {
                            isAllow: true,
                            transcriptionFeatures: create(InsightsTranscriptionFeaturesSchema, {
                                isAllow: true,
                                isAllowTranslation: true,
                                maxSelectedTransLangs: 2,
                            }),
                            chatTranslationFeatures: create(InsightsChatTranslationFeaturesSchema, {
                                isAllow: true,
                            }),
                            aiFeatures: create(InsightsAIFeaturesSchema, {
                                isAllow: true,
                                aiTextChatFeatures: create(InsightsAITextChatFeaturesSchema, {
                                    isAllow: true,
                                }),
                                meetingSummarizationFeatures: create(InsightsAIMeetingSummarizationFeaturesSchema, {
                                    isAllow: true,
                                })
                            }),
                        }),
                    }),
                }),
            });

            await lastValueFrom(
                this.natsClient.send({ cmd: 'room.create' }, createRoomReq)
            );
            this.logger.log(`Created WebRTC room for live session: ${roomId}`);
        } catch (error) {
            this.logger.error(`Failed to create WebRTC room: ${error.message}`);
        }

        const updated = await this.liveSessionRepository.update(id, {
            status: LiveSessionStatus.LIVE,
            meetingId: roomId,
        });
        return this.mapper.map<any, LiveSessionResponseDTO>(updated, 'LiveSession', 'LiveSessionResponseDTO');
    }

    async endSession(requester: Requester, id: string): Promise<LiveSessionResponseDTO> {
        const existing = await this.liveSessionRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Live session with id ${id} not found`);
        }

        // Only Admin, Staff (manage), or the assigned Lecturer can end the session
        const isAssigned = existing.lecturerId === requester.sub;
        const hasManagePermission = this.hasPermission(requester, 'live_class.manage');

        if (!isAssigned && !hasManagePermission && requester.role !== 'admin') {
            throw new ForbiddenException('You are not authorized to end this session');
        }

        // End room in Meet module
        if (existing.meetingId) {
            try {
                await lastValueFrom(
                    this.natsClient.send({ cmd: 'room.end' }, { roomId: existing.meetingId })
                );
                this.logger.log(`Ended WebRTC room for live session: ${existing.meetingId}`);
            } catch (error) {
                this.logger.error(`Failed to end WebRTC room: ${error.message}`);
            }
        }

        const updated = await this.liveSessionRepository.update(id, { status: LiveSessionStatus.ENDED });
        return this.mapper.map<any, LiveSessionResponseDTO>(updated, 'LiveSession', 'LiveSessionResponseDTO');
    }

    async joinSession(requester: Requester, id: string): Promise<LiveSessionJoinResponseDTO> {
        // ... (existing joinSession code)
        const session = await this.liveSessionRepository.findById(id);
        if (!session) {
            throw new NotFoundException(`Live session with id ${id} not found`);
        }

        if (session.status !== LiveSessionStatus.LIVE) {
            throw new BadRequestException('Session is not live');
        }

        // Authorization check
        const hasManagePermission = this.hasPermission(requester, 'live_class.manage');
        const hasViewRestricted = this.hasPermission(requester, 'course.view_restricted');
        const isLecturer = session.lecturerId === requester.sub;

        let hasAccess = hasManagePermission || hasViewRestricted || isLecturer || requester.role === 'admin';

        if (!hasAccess) {
            // Check enrollments for student in any course run of this session's course
            const enrollments = await this.prisma.enrollment.findMany({
                where: {
                    userId: requester.sub,
                    courseRunId: session.courseRunId,
                },
                include: { courseRun: true },
            });

            if (enrollments.length > 0) {
                // Check if any enrollment is still valid
                const enrollment = enrollments[0];
                // Block if enrollment has expired
                if (enrollment.expiresAt && enrollment.expiresAt < new Date()) {
                    throw new ForbiddenException('Your enrollment has expired');
                }
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to this live session');
        }

        // Request token from Meet module
        try {
            const tokenResponse = await lastValueFrom(
                this.natsClient.send({ cmd: 'user.generateJoinToken' }, {
                    roomId: session.meetingId,
                    userInfo: {
                        userId: requester.sub,
                        name: requester.user_metadata?.displayName || 'User',
                        isAdmin: hasManagePermission || hasViewRestricted || isLecturer || requester.role === 'admin',
                    },
                })
            );

            // Get room info to return SID
            const roomInfo = await lastValueFrom(
                this.natsClient.send({ cmd: 'room.getRoomInfoByRoomId' }, { roomId: session.meetingId, isRunning: true })
            );

            return {
                token: tokenResponse.token,
                roomId: session.meetingId!,
                roomTitle: session.title,
                sid: roomInfo.sid,
            };
        } catch (error) {
            this.logger.error(`Failed to join WebRTC room: ${error.message}`);
            throw new BadRequestException(`Failed to join live session: ${error.message}`);
        }
    }

    async syncEndedSession(meetingId: string): Promise<LiveSessionResponseDTO | null> {
        this.logger.log(`Syncing ended session for meetingId: ${meetingId}`);
        const sessions = await this.prisma.liveSession.findMany({
            where: {
                meetingId: meetingId,
                status: LiveSessionStatus.LIVE,
            },
        });

        let updatedSession: any = null;
        for (const session of sessions) {
            const updated = await this.liveSessionRepository.update(session.id, {
                status: LiveSessionStatus.ENDED,
            });
            updatedSession = updated;
            this.logger.log(`Updated LiveSession ${session.id} to ENDED via sync`);
        }

        return updatedSession ? this.mapper.map<any, LiveSessionResponseDTO>(updatedSession, 'LiveSession', 'LiveSessionResponseDTO') : null;
    }

    async findActiveByRunId(courseRunId: string): Promise<LiveSessionResponseDTO | null> {
        const session = await this.prisma.liveSession.findFirst({
            where: {
                courseRunId,
                status: LiveSessionStatus.LIVE,
            },
        });
        if (!session) return null;
        return this.mapper.map<any, LiveSessionResponseDTO>(session, 'LiveSession', 'LiveSessionResponseDTO');
    }

    async findByCourseId(courseMasterId: string): Promise<LiveSessionResponseDTO[]> {
        const sessions = await this.prisma.liveSession.findMany({
            where: {
                courseRun: {
                    courseMasterId,
                },
            },
            orderBy: {
                scheduledAt: 'asc',
            },
        });
        return sessions.map((s) => this.mapper.map<any, LiveSessionResponseDTO>(s, 'LiveSession', 'LiveSessionResponseDTO'));
    }

    async findActiveByCourseId(courseMasterId: string): Promise<LiveSessionResponseDTO | null> {
        const session = await this.prisma.liveSession.findFirst({
            where: {
                courseRun: {
                    courseMasterId,
                },
                status: LiveSessionStatus.LIVE,
            },
        });
        if (!session) return null;
        return this.mapper.map<any, LiveSessionResponseDTO>(session, 'LiveSession', 'LiveSessionResponseDTO');
    }

    async findByMeetingId(meetingId: string): Promise<LiveSessionResponseDTO | null> {
        const session = await this.prisma.liveSession.findFirst({
            where: { meetingId },
        });
        if (!session) return null;
        return this.mapper.map<any, LiveSessionResponseDTO>(session, 'LiveSession', 'LiveSessionResponseDTO');
    }
}

