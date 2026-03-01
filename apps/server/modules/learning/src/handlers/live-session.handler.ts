import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { LIVE_SESSION_SERVICE_TOKEN, ILiveSessionService } from '@server/learning/interfaces/services';
import { LiveSessionBulkCreateDTO, LiveSessionCreateDTO, LiveSessionUpdateDTO, Requester, LiveSessionStatus } from '@workspace/schemas';

@Controller()
export class LiveSessionHandler {
    private readonly logger = new Logger(LiveSessionHandler.name);

    constructor(
        @Inject(LIVE_SESSION_SERVICE_TOKEN) private readonly liveSessionService: ILiveSessionService
    ) { }

    @EventPattern('events.meet.room_ended')
    async handleRoomEnded(@Payload() data: { roomId: string; roomSID: string }) {
        this.logger.log(`Received room_ended event for roomId: ${data.roomId}`);
        try {
            // Find live session by meetingId (which is the roomId in meet module)
            // and update its status to ENDED
            await (this.liveSessionService as any).syncEndedSession(data.roomId);
        } catch (error) {
            this.logger.error(`Failed to sync ended session: ${error.message}`);
        }
    }

    @MessagePattern({ cmd: 'learning.liveSession.create' })
    async create(@Payload() data: LiveSessionCreateDTO & { userId: string; userRole: string; userEmail: string; displayName?: string }) {
        const { userId, userRole, userEmail, displayName, ...dto } = data;
        const requester: Requester & { email: string; displayName?: string } = {
            sub: userId,
            role: userRole as any,
            email: userEmail,
            displayName,
        };
        return this.liveSessionService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.liveSession.bulkCreate' })
    async bulkCreate(@Payload() data: LiveSessionBulkCreateDTO & { userId: string; userRole: string; userEmail: string; displayName?: string }) {
        const { userId, userRole, userEmail, displayName, ...dto } = data;
        const requester: Requester & { email: string; displayName?: string } = {
            sub: userId,
            role: userRole as any,
            email: userEmail,
            displayName,
        };
        return this.liveSessionService.bulkCreate(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.liveSession.update' })
    async update(@Payload() data: LiveSessionUpdateDTO & { id: string; userId: string; userRole: string; userEmail: string }) {
        const { id, userId, userRole, userEmail, ...dto } = data;
        const requester: Requester & { email: string } = { sub: userId, role: userRole as any, email: userEmail };
        return this.liveSessionService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.liveSession.delete' })
    async delete(@Payload() data: { id: string; userId: string; userRole: string; userEmail: string }) {
        const { id, userId, userRole, userEmail } = data;
        const requester: Requester & { email: string } = { sub: userId, role: userRole as any, email: userEmail };
        return this.liveSessionService.delete(requester, id);
    }

    @MessagePattern({ cmd: 'learning.liveSession.findByCourseId' })
    async findByCourseId(@Payload() data: { courseMasterId: string }) {
        return this.liveSessionService.findByCourseId(data.courseMasterId);
    }

    @MessagePattern({ cmd: 'learning.liveSession.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.liveSessionService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.liveSession.start' })
    async start(@Payload() data: { id: string; userId: string; userRole: string; userEmail: string }) {
        const { id, userId, userRole, userEmail } = data;
        const requester: Requester & { email: string } = { sub: userId, role: userRole as any, email: userEmail };
        return this.liveSessionService.startSession(requester, id);
    }

    @MessagePattern({ cmd: 'learning.liveSession.end' })
    async end(@Payload() data: { id: string; userId: string; userRole: string; userEmail: string }) {
        const { id, userId, userRole, userEmail } = data;
        const requester: Requester & { email: string } = { sub: userId, role: userRole as any, email: userEmail };
        return this.liveSessionService.endSession(requester, id);
    }

    @MessagePattern({ cmd: 'learning.liveSession.join' })
    async join(@Payload() data: { id: string; userId: string; userRole: string; userEmail: string; displayName?: string }) {
        const { id, userId, userRole, userEmail, displayName } = data;
        const requester: Requester & { email: string; displayName?: string } = {
            sub: userId,
            role: userRole as any,
            email: userEmail,
            displayName,
        };
        return this.liveSessionService.joinSession(requester, id);
    }
}

