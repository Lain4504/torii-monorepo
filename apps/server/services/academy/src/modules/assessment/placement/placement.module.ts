import { Module } from '@nestjs/common';
import { PlacementService } from './placement.service';
import { PlacementHandler } from './placement.handler';
import { ExamAttemptModule } from '../exam-attempt/exam-attempt.module';

@Module({
  imports: [ExamAttemptModule],
  providers: [PlacementService],
  controllers: [PlacementHandler],
  exports: [PlacementService],
})
export class PlacementModule { }

