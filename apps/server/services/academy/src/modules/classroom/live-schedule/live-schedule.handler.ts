import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LiveScheduleService } from './live-schedule.service';
import {
  LiveScheduleCreateDto,
  LiveScheduleQueryDto,
  LiveScheduleUpdateDto,
} from './dto/live-schedule.dto';
import { LiveSessionJoinDto } from './dto/live-session.dto';

@Controller()
export class LiveScheduleHandler {
  constructor(private readonly schedules: LiveScheduleService) { }

  @MessagePattern({ cmd: 'academy.liveSchedule.findAll' })
  findAll(@Payload() query: LiveScheduleQueryDto) {
    return this.schedules.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.liveSchedule.findById' })
  findById(@Payload() data: { id: string }) {
    return this.schedules.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.liveSchedule.create' })
  create(@Payload() input: LiveScheduleCreateDto & { requesterId?: string }) {
    const { requesterId, ...dto } = input;
    return this.schedules.create(dto, requesterId);
  }

  @MessagePattern({ cmd: 'academy.liveSchedule.update' })
  update(@Payload() data: { id: string; input: LiveScheduleUpdateDto; requesterId?: string }) {
    return this.schedules.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.liveSchedule.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.schedules.delete(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.liveSession.join' })
  join(@Payload() data: LiveSessionJoinDto & { isAdmin?: boolean }) {
    return this.schedules.join(data.id, data.userId, data.isAdmin);
  }
}
