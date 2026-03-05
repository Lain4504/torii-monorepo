import { Module } from '@nestjs/common';
import { ClassAssessmentHandler } from './class-assessment.handler';
import { ClassAssessmentService } from './class-assessment.service';

@Module({
  providers: [ClassAssessmentService],
  controllers: [ClassAssessmentHandler],
})
export class ClassAssessmentModule {}

