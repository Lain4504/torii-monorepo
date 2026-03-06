import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChapterService } from './chapter.service';
import {
  ChapterCreateDto,
  ChapterQueryDto,
  ChapterReorderDto,
  ChapterUpdateDto,
} from './dto/chapter.dto';

@Controller()
export class ChapterHandler {
  constructor(private readonly chapters: ChapterService) { }

  @MessagePattern({ cmd: 'academy.chapter.findAll' })
  findAll(@Payload() query: ChapterQueryDto) {
    return this.chapters.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.chapter.findById' })
  findById(@Payload() data: { id: string }) {
    return this.chapters.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.chapter.create' })
  create(@Payload() input: ChapterCreateDto) {
    return this.chapters.create(input);
  }

  @MessagePattern({ cmd: 'academy.chapter.update' })
  update(@Payload() data: { id: string; input: ChapterUpdateDto }) {
    return this.chapters.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.chapter.reorder' })
  reorder(@Payload() input: ChapterReorderDto) {
    return this.chapters.reorderChapters(input);
  }

  @MessagePattern({ cmd: 'academy.chapter.delete' })
  delete(@Payload() data: { id: string }) {
    return this.chapters.delete(data.id);
  }
}

