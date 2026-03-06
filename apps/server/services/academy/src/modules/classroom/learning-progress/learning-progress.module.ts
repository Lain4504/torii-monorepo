import { Module } from '@nestjs/common';
import { LearningProgressHandler } from './learning-progress.handler';
import { LearningProgressService } from './learning-progress.service';

@Module({
  providers: [LearningProgressService],
  controllers: [LearningProgressHandler],
})
export class LearningProgressModule {}

