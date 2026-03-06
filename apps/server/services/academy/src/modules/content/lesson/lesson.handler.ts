import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LessonService } from './lesson.service';
import { LessonCreateDto, LessonQueryDto, LessonUpdateDto } from './dto/lesson.dto';

@Controller()
export class LessonHandler {
  constructor(private readonly lessons: LessonService) {}

  @MessagePattern({ cmd: 'academy.lesson.findAll' })
  findAll(@Payload() query: LessonQueryDto) {
    return this.lessons.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.lesson.findById' })
  findById(@Payload() data: { id: string }) {
    return this.lessons.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.lesson.create' })
  create(@Payload() input: LessonCreateDto) {
    return this.lessons.create(input);
  }

  @MessagePattern({ cmd: 'academy.lesson.update' })
  update(@Payload() data: { id: string; input: LessonUpdateDto }) {
    return this.lessons.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.lesson.delete' })
  delete(@Payload() data: { id: string }) {
    return this.lessons.delete(data.id);
  }
}

