import { Module } from '@nestjs/common';
import { ClassModule } from './class/class.module';
import { ClassScheduleModule } from './class-schedule/class-schedule.module';
import { ClassAssessmentModule } from './class-assessment/class-assessment.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { LearningProgressModule } from './learning-progress/learning-progress.module';
import { ClassroomCronService } from './classroom-cron.service';
import { CertificateModule } from './certificate/certificate.module';
import { ClassReviewModule } from './class-review/class-review.module';

@Module({
  imports: [
    ClassModule,
    ClassScheduleModule,
    ClassAssessmentModule,
    EnrollmentModule,
    LearningProgressModule,
    CertificateModule,
    ClassReviewModule,
  ],
  providers: [ClassroomCronService],
})
export class ClassroomModule { }

