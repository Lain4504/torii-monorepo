import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LessonService } from './lesson.service';
import { LessonCreateDto, LessonQueryDto, LessonUpdateDto } from './dto/lesson.dto';

@Controller()
export class LessonHandler {
  constructor(private readonly lessons: LessonService) { }

  @MessagePattern({ cmd: 'academy.lesson.findAll' })
  findAll(@Payload() query: LessonQueryDto) {
    return this.lessons.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.lesson.findById' })
  findById(@Payload() data: { id: string }) {
    return this.lessons.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.lesson.create' })
  create(@Payload() data: LessonCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.lessons.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.lesson.update' })
  update(@Payload() data: { id: string; input: LessonUpdateDto; requesterId?: string }) {
    return this.lessons.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.lesson.getUsage' })
  getUsage(@Payload() data: { id: string }) {
    return this.lessons.getUsage(data.id);
  }

  @MessagePattern({ cmd: 'academy.lesson.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.lessons.delete(data.id, data.requesterId);
  }
}

