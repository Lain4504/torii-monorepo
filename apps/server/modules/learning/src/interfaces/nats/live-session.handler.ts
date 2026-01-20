import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LIVE_SESSION_SERVICE_TOKEN, ILiveSessionService } from '../../interfaces/services';
import { LiveSessionCreateDTO, LiveSessionUpdateDTO, Requester } from '@workspace/schemas';

@Controller()
export class LiveSessionHandler {
    constructor(
        @Inject(LIVE_SESSION_SERVICE_TOKEN) private readonly liveSessionService: ILiveSessionService
    ) { }

    @MessagePattern({ cmd: 'learning.liveSession.create' })
    async create(@Payload() data: LiveSessionCreateDTO & { userId: string; userRole: string; userEmail: string }) {
        const { userId, userRole, userEmail, ...dto } = data;
        const requester: Requester & { email: string } = { sub: userId, role: userRole as any, email: userEmail };
        return this.liveSessionService.create(requester, dto);
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
    async findByCourseId(@Payload() data: { courseId: string }) {
        return this.liveSessionService.findByCourseId(data.courseId);
    }

    @MessagePattern({ cmd: 'learning.liveSession.findOne' })
    async findOne(@Payload() data: { id: string }) {
        return this.liveSessionService.findOne(data.id);
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
}
