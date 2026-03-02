import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { LIVE_SESSION_SERVICE_TOKEN, ILiveSessionService } from '@server/learning/interfaces/services';
import { LiveSessionBulkCreateDTO, LiveSessionCreateDTO, LiveSessionUpdateDTO, Requester, LiveSessionStatus } from '@workspace/schemas';

import { ATTENDANCE_SERVICE_TOKEN, IAttendanceService } from '@server/learning/interfaces/services';

@Controller()
export class LiveSessionHandler {
    private readonly logger = new Logger(LiveSessionHandler.name);

    constructor(
        @Inject(LIVE_SESSION_SERVICE_TOKEN) private readonly liveSessionService: ILiveSessionService,
        @Inject(ATTENDANCE_SERVICE_TOKEN) private readonly attendanceService: IAttendanceService
    ) { }

    @EventPattern('events.meet.room_ended')
    async handleRoomEnded(@Payload() data: { roomId: string; roomSID: string }) {
        this.logger.log(`Received room_ended event for roomId: ${data.roomId}`);
        try {
            // Find live session by meetingId (which is the roomId in meet module)
            // and update its status to ENDED
            const session = await (this.liveSessionService as any).syncEndedSession(data.roomId);
            if (session) {
                // Process final attendance calculation (70% threshold)
                await this.attendanceService.processFinalAttendance(session.id);
            }
        } catch (error) {
            this.logger.error(`Failed to sync ended session or calc attendance: ${error.message}`);
        }
    }

    @EventPattern('events.meet.user_joined')
    async handleUserJoined(@Payload() data: { roomId: string; userId: string }) {
        this.logger.log(`User ${data.userId} joined room ${data.roomId}`);
        try {
            // Find live session by roomId
            const session = await this.liveSessionService.findByMeetingId(data.roomId);
            if (session) {
                await this.attendanceService.processUserJoined(session.id, data.userId);
            }
        } catch (error) {
            this.logger.error(`Failed to handle user joined: ${error.message}`);
        }
    }

    @EventPattern('events.meet.user_left')
    async handleUserLeft(@Payload() data: { roomId: string; userId: string }) {
        this.logger.log(`User ${data.userId} left room ${data.roomId}`);
        try {
            // Find live session by roomId
            const session = await this.liveSessionService.findByMeetingId(data.roomId);
            if (session) {
                await this.attendanceService.processUserLeft(session.id, data.userId);
            }
        } catch (error) {
            this.logger.error(`Failed to handle user left: ${error.message}`);
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

    @MessagePattern({ cmd: 'learning.liveSession.findByRunId' })
    async findByRunId(@Payload() data: { courseRunId: string }) {
        return this.liveSessionService.findByRunId(data.courseRunId);
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

