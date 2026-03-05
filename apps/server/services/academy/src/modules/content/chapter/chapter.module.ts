import { Module } from '@nestjs/common';
import { ChapterHandler } from './chapter.handler';
import { ChapterService } from './chapter.service';

@Module({
  providers: [ChapterService],
  controllers: [ChapterHandler],
})
export class ChapterModule {}

