import { Module } from '@nestjs/common';
import { ClassModule } from './class/class.module';
import { ClassScheduleModule } from './class-schedule/class-schedule.module';
import { ClassAssessmentModule } from './class-assessment/class-assessment.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { LearningProgressModule } from './learning-progress/learning-progress.module';
import { CertificateModule } from './certificate/certificate.module';

@Module({
  imports: [
    ClassModule,
    ClassScheduleModule,
    ClassAssessmentModule,
    EnrollmentModule,
    LearningProgressModule,
    CertificateModule,
  ],
})
export class ClassroomModule { }

