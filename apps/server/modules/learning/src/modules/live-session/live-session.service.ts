import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import {
    LiveSessionCreateDTO,
    LiveSessionResponseDTO,
    LiveSessionUpdateDTO,
    Requester,
    UserRole,
    LiveSessionStatus,
} from '@workspace/schemas';
import type { LiveSession } from '@prisma/generated';
import { ILiveSessionService } from '../../interfaces/services/i-live-session.service';
import {
    ILiveSessionRepository,
    LIVE_SESSION_REPOSITORY_TOKEN,
    COURSE_REPOSITORY_TOKEN,
    ICourseRepository,
} from '../../interfaces/repositories';
import { PrismaService } from '@server/shared';

@Injectable()
export class LiveSessionService implements ILiveSessionService {
    private readonly logger = new Logger(LiveSessionService.name);

    constructor(
        @Inject(LIVE_SESSION_REPOSITORY_TOKEN)
        private readonly liveSessionRepository: ILiveSessionRepository,
        @Inject(COURSE_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseRepository,
        private readonly prisma: PrismaService,
    ) { }

    private toLiveSessionResponseDTO(session: LiveSession): LiveSessionResponseDTO {
        return {
            id: session.id,
            courseId: session.courseId,
            lecturerId: session.lecturerId,
            title: session.title,
            description: session.description,
            scheduledAt: session.scheduledAt,
            duration: session.duration,
            status: session.status,
            meetingId: session.meetingId,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        };
    }

    async findOne(id: string): Promise<LiveSessionResponseDTO> {
        const session = await this.liveSessionRepository.findById(id);
        if (!session) {
            throw new NotFoundException(`Live session with id ${id} not found`);
        }
        return this.toLiveSessionResponseDTO(session);
    }

    async findByCourseId(courseId: string): Promise<LiveSessionResponseDTO[]> {
        const sessions = await this.liveSessionRepository.findByCourseId(courseId);
        return sessions.map((s) => this.toLiveSessionResponseDTO(s));
    }

    async create(requester: Requester, dto: LiveSessionCreateDTO): Promise<LiveSessionResponseDTO> {
        // Only Admin and Staff (LMS) can create live sessions
        if (![UserRole.ADMIN, UserRole.STAFF, (UserRole as any).STAFF_LMS].includes(requester.role as UserRole)) {
            throw new ForbiddenException('Only admins and academic staff can schedule live sessions');
        }

        const course = await this.courseRepository.findById(dto.courseId);
        if (!course) {
            throw new NotFoundException(`Course with id ${dto.courseId} not found`);
        }

        if (course.type !== 'live') {
            throw new BadRequestException('Live sessions can only be scheduled for live courses');
        }

        const session = await this.liveSessionRepository.create({
            course: { connect: { id: dto.courseId } },
            title: dto.title,
            description: dto.description,
            scheduledAt: new Date(dto.scheduledAt),
            duration: dto.duration,
            lecturerId: dto.lecturerId,
        });

        return this.toLiveSessionResponseDTO(session);
    }

    async update(requester: Requester, id: string, dto: LiveSessionUpdateDTO): Promise<LiveSessionResponseDTO> {
        // Only Admin and Staff (LMS) can update live sessions
        if (![UserRole.ADMIN, UserRole.STAFF, (UserRole as any).STAFF_LMS].includes(requester.role as UserRole)) {
            throw new ForbiddenException('Only admins and academic staff can update live sessions');
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
        return this.toLiveSessionResponseDTO(updated);
    }

    async delete(requester: Requester, id: string): Promise<{ message: string }> {
        // Only Admin and Staff (LMS) can delete live sessions
        if (![UserRole.ADMIN, UserRole.STAFF, (UserRole as any).STAFF_LMS].includes(requester.role as UserRole)) {
            throw new ForbiddenException('Only admins and academic staff can delete live sessions');
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

        // Only Admin, Staff, or the assigned Lecturer can start the session
        const isAssigned = existing.lecturerId === requester.sub;
        const isStaff = [UserRole.ADMIN, UserRole.STAFF, (UserRole as any).STAFF_LMS].includes(requester.role as UserRole);

        if (!isAssigned && !isStaff) {
            throw new ForbiddenException('You are not authorized to start this session');
        }

        const updated = await this.liveSessionRepository.update(id, { status: LiveSessionStatus.LIVE });
        return this.toLiveSessionResponseDTO(updated);
    }

    async endSession(requester: Requester, id: string): Promise<LiveSessionResponseDTO> {
        const existing = await this.liveSessionRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Live session with id ${id} not found`);
        }

        // Only Admin, Staff, or the assigned Lecturer can end the session
        const isAssigned = existing.lecturerId === requester.sub;
        const isStaff = [UserRole.ADMIN, UserRole.STAFF, (UserRole as any).STAFF_LMS].includes(requester.role as UserRole);

        if (!isAssigned && !isStaff) {
            throw new ForbiddenException('You are not authorized to end this session');
        }

        const updated = await this.liveSessionRepository.update(id, { status: LiveSessionStatus.ENDED });
        return this.toLiveSessionResponseDTO(updated);
    }
}
