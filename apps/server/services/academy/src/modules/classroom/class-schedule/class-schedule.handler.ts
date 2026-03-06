import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClassScheduleService } from './class-schedule.service';
import {
  ClassScheduleCreateDto,
  ClassScheduleQueryDto,
  ClassScheduleUpdateDto,
} from './dto/class-schedule.dto';

@Controller()
export class ClassScheduleHandler {
  constructor(private readonly schedules: ClassScheduleService) {}

  @MessagePattern({ cmd: 'academy.classSchedule.findAll' })
  findAll(@Payload() query: ClassScheduleQueryDto) {
    return this.schedules.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.classSchedule.findById' })
  findById(@Payload() data: { id: string }) {
    return this.schedules.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.classSchedule.create' })
  create(@Payload() input: ClassScheduleCreateDto) {
    return this.schedules.create(input);
  }

  @MessagePattern({ cmd: 'academy.classSchedule.update' })
  update(@Payload() data: { id: string; input: ClassScheduleUpdateDto }) {
    return this.schedules.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.classSchedule.delete' })
  delete(@Payload() data: { id: string }) {
    return this.schedules.delete(data.id);
  }
}

