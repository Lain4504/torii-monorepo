import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LessonService } from './lesson.service';
import {
  type LessonCreateDTO,
  type LessonUpdateDTO,
  type LessonQueryDTO,
} from '@workspace/schemas';

@Controller()
export class LessonController {
  private readonly logger = new Logger(LessonController.name);

  constructor(private readonly lessonService: LessonService) {
    this.logger.log('LessonController initialized and listening for events');
  }

  @MessagePattern({ cmd: 'lesson.findAll' })
  async findAll(@Payload() query: LessonQueryDTO) {
    return await this.lessonService.findAll(query);
  }

  @MessagePattern({ cmd: 'lesson.findOne' })
  async findOne(@Payload() id: string) {
    return await this.lessonService.findOne(id);
  }

  @MessagePattern({ cmd: 'lesson.create' })
  async create(@Payload() input: LessonCreateDTO) {
    this.logger.log('Received lesson.create request');
    return await this.lessonService.create(input);
  }

  @MessagePattern({ cmd: 'lesson.update' })
  async update(@Payload() data: { id: string; input: LessonUpdateDTO }) {
    return await this.lessonService.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'lesson.delete' })
  async delete(@Payload() id: string) {
    return await this.lessonService.delete(id);
  }

  @MessagePattern({ cmd: 'lesson.restore' })
  async restore(@Payload() id: string) {
    return await this.lessonService.restore(id);
  }
}
