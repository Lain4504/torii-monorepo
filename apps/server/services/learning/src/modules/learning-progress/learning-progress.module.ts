import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { LearningProgressController } from '@server/learning/modules/learning-progress/learning-progress.controller';
import { LearningProgressService } from '@server/learning/modules/learning-progress/learning-progress.service';
import { LearningProgressRepository } from '@server/learning/modules/learning-progress/learning-progress.repository';
import { EnrollmentRepository } from '@server/learning/modules/enrollment/enrollment.repository';
import { CourseMasterRepository } from '@server/learning/modules/course-master/course-master.repository';
import { LessonRepository } from '@server/learning/modules/lesson/lesson.repository';
import { ModuleRepository } from '@server/learning/modules/module/module.repository';
import { CertificateModule } from '@server/learning/modules/certificate/certificate.module';

import { LEARNING_PROGRESS_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import {
  LEARNING_PROGRESS_REPOSITORY_TOKEN,
  ENROLLMENT_REPOSITORY_TOKEN,
  COURSE_MASTER_REPOSITORY_TOKEN,
  LESSON_REPOSITORY_TOKEN,
  MODULE_REPOSITORY_TOKEN,
} from '@server/learning/interfaces/repositories';

@Module({
  imports: [
    PrismaModule,
    NatsClientModule,
    forwardRef(() => CertificateModule),
  ],
  controllers: [LearningProgressController],
  providers: [
    {
      provide: LEARNING_PROGRESS_SERVICE_TOKEN,
      useClass: LearningProgressService,
    },
    {
      provide: LEARNING_PROGRESS_REPOSITORY_TOKEN,
      useClass: LearningProgressRepository,
    },
    {
      provide: ENROLLMENT_REPOSITORY_TOKEN,
      useClass: EnrollmentRepository,
    },
    {
      provide: COURSE_MASTER_REPOSITORY_TOKEN,
      useClass: CourseMasterRepository,
    },
    {
      provide: LESSON_REPOSITORY_TOKEN,
      useClass: LessonRepository,
    },
    {
      provide: MODULE_REPOSITORY_TOKEN,
      useClass: ModuleRepository,
    },
  ],
  exports: [LEARNING_PROGRESS_SERVICE_TOKEN],
})
export class LearningProgressModule {}
