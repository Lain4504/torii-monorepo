import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TeachingScheduleService } from '@server/learning/modules/teaching-schedule/teaching-schedule.service';
import {
  TeachingScheduleCreateDTO,
  ScheduleRequestCreateDTO,
  Requester,
} from '@workspace/schemas';

@Controller()
export class TeachingScheduleHandler {
  constructor(private readonly scheduleService: TeachingScheduleService) {}

  @MessagePattern({ cmd: 'learning.teachingSchedule.checkAvailability' })
  async checkAvailability(
    @Payload()
    data: {
      lecturerId: string;
      dayOfWeek: number;
      startTime: string;
      duration: number;
      excludeScheduleId?: string;
    },
  ) {
    return this.scheduleService.checkAvailability(
      data.lecturerId,
      data.dayOfWeek,
      data.startTime,
      data.duration,
      data.excludeScheduleId,
    );
  }

  @MessagePattern({ cmd: 'learning.teachingSchedule.assign' })
  async assign(
    @Payload() data: TeachingScheduleCreateDTO & { requester: Requester },
  ) {
    const { requester, ...dto } = data;
    return this.scheduleService.assignSchedule(requester, dto);
  }

  @MessagePattern({ cmd: 'learning.teachingSchedule.findByRun' })
  async findByRun(@Payload() data: { courseRunId: string }) {
    return this.scheduleService.findByRun(data.courseRunId);
  }

  @MessagePattern({ cmd: 'learning.teachingSchedule.findByLecturer' })
  async findByLecturer(@Payload() data: { lecturerId: string }) {
    return this.scheduleService.findByLecturer(data.lecturerId);
  }

  @MessagePattern({ cmd: 'learning.teachingSchedule.remove' })
  async remove(@Payload() data: { id: string; requester: Requester }) {
    return this.scheduleService.removeSchedule(data.requester, data.id);
  }

  @MessagePattern({ cmd: 'learning.teachingSchedule.createRequest' })
  async createRequest(
    @Payload() data: ScheduleRequestCreateDTO & { requester: Requester },
  ) {
    const { requester, ...dto } = data;
    return this.scheduleService.createRequest(requester, dto);
  }

  @MessagePattern({ cmd: 'learning.teachingSchedule.getPendingRequests' })
  async getPendingRequests(@Payload() data: { requester: Requester }) {
    return this.scheduleService.getPendingRequests(data.requester);
  }

  @MessagePattern({ cmd: 'learning.teachingSchedule.handleRequest' })
  async handleRequest(
    @Payload()
    data: {
      requestId: string;
      action: 'approve' | 'reject';
      requester: Requester;
    },
  ) {
    return this.scheduleService.handleRequest(
      data.requester,
      data.requestId,
      data.action,
    );
  }
}
