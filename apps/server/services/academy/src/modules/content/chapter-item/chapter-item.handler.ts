import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChapterItemService } from './chapter-item.service';
import {
  ChapterItemCreateDto,
  ChapterItemQueryDto,
  ChapterItemReorderDto,
  ChapterItemUpdateDto,
} from './dto/chapter-item.dto';

@Controller()
export class ChapterItemHandler {
  constructor(private readonly items: ChapterItemService) { }

  @MessagePattern({ cmd: 'academy.chapterItem.findAll' })
  findAll(@Payload() query: ChapterItemQueryDto) {
    return this.items.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.chapterItem.findById' })
  findById(@Payload() data: { id: string }) {
    return this.items.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.chapterItem.create' })
  create(@Payload() input: ChapterItemCreateDto) {
    return this.items.create(input);
  }

  @MessagePattern({ cmd: 'academy.chapterItem.update' })
  update(@Payload() data: { id: string; input: ChapterItemUpdateDto }) {
    return this.items.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.chapterItem.reorder' })
  reorder(@Payload() input: ChapterItemReorderDto) {
    return this.items.reorderItems(input);
  }

  @MessagePattern({ cmd: 'academy.chapterItem.delete' })
  delete(@Payload() data: { id: string }) {
    return this.items.delete(data.id);
  }
}

