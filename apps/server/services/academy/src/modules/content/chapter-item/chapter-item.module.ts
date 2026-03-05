import { Module } from '@nestjs/common';
import { ChapterItemHandler } from './chapter-item.handler';
import { ChapterItemService } from './chapter-item.service';

@Module({
  providers: [ChapterItemService],
  controllers: [ChapterItemHandler],
})
export class ChapterItemModule {}

