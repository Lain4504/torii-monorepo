import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TeachingScheduleService } from '../../modules/teaching-schedule/teaching-schedule.service';
import {
    TeachingScheduleCreateDTO,
    ScheduleRequestCreateDTO,
    Requester
} from '@workspace/schemas';

@Controller()
export class TeachingScheduleHandler {
    constructor(private readonly scheduleService: TeachingScheduleService) { }

    @MessagePattern({ cmd: 'learning.teachingSchedule.checkAvailability' })
    async checkAvailability(@Payload() data: { lecturerId: string; dayOfWeek: number; startTime: string; duration: number; excludeScheduleId?: string }) {
        return this.scheduleService.checkAvailability(data.lecturerId, data.dayOfWeek, data.startTime, data.duration, data.excludeScheduleId);
    }

    @MessagePattern({ cmd: 'learning.teachingSchedule.assign' })
    async assign(@Payload() data: TeachingScheduleCreateDTO & { userId: string; userRole: string; userEmail: string; displayName?: string }) {
        const { userId, userRole, userEmail, displayName, ...dto } = data;
        const requester: Requester = {
            sub: userId,
            role: userRole as any,
        };
        return this.scheduleService.assignSchedule(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.teachingSchedule.findByCourse' })
    async findByCourse(@Payload() data: { courseId: string }) {
        return this.scheduleService.findByCourse(data.courseId);
    }

    @MessagePattern({ cmd: 'learning.teachingSchedule.findByLecturer' })
    async findByLecturer(@Payload() data: { lecturerId: string }) {
        return this.scheduleService.findByLecturer(data.lecturerId);
    }

    @MessagePattern({ cmd: 'learning.teachingSchedule.remove' })
    async remove(@Payload() data: { id: string; userId: string; userRole: string }) {
        const requester: Requester = {
            sub: data.userId,
            role: data.userRole as any,
        };
        return this.scheduleService.removeSchedule(requester, data.id);
    }

    @MessagePattern({ cmd: 'learning.teachingSchedule.createRequest' })
    async createRequest(@Payload() data: ScheduleRequestCreateDTO & { userId: string; userRole: string }) {
        const { userId, userRole, ...dto } = data;
        const requester: Requester = {
            sub: userId,
            role: userRole as any,
        };
        return this.scheduleService.createRequest(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.teachingSchedule.getPendingRequests' })
    async getPendingRequests() {
        return this.scheduleService.getPendingRequests();
    }

    @MessagePattern({ cmd: 'learning.teachingSchedule.handleRequest' })
    async handleRequest(@Payload() data: { requestId: string; action: 'approve' | 'reject'; userId: string; userRole: string }) {
        const requester: Requester = {
            sub: data.userId,
            role: data.userRole as any,
        };
        return this.scheduleService.handleRequest(requester, data.requestId, data.action);
    }
}
