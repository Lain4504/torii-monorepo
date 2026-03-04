import { Module, forwardRef } from '@nestjs/common';
import { LessonMaterialHandler } from '@server/learning/modules/lesson-material/lesson-material.handler';
import { LessonMaterialProfile } from '@server/learning/infrastructure/mappings/lesson-material.profile';
import { NatsClientModule, SharedStorageModule } from '@server/shared';
import { LessonMaterialService } from '@server/learning/modules/lesson-material/lesson-material.service';
import { LessonMaterialRepository } from '@server/learning/modules/lesson-material/lesson-material.repository';
import { LESSON_MATERIAL_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { LESSON_MATERIAL_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { ModuleModule } from '@server/learning/modules/module/module.module';

/**
 * Lesson Material Feature Module
 * Handles lesson material upload and management
 */
@Module({
    imports: [
        SharedStorageModule,
        NatsClientModule,
        forwardRef(() => EnrollmentModule),
        forwardRef(() => ModuleModule),
    ],
  controllers: [LessonMaterialHandler],
    providers: [
        {
            provide: LESSON_MATERIAL_REPOSITORY_TOKEN,
            useClass: LessonMaterialRepository,
        },
        {
            provide: LESSON_MATERIAL_SERVICE_TOKEN,
            useClass: LessonMaterialService,
        },
        LessonMaterialProfile,
    ],
    exports: [LESSON_MATERIAL_SERVICE_TOKEN, LESSON_MATERIAL_REPOSITORY_TOKEN],
})
export class LessonMaterialModule { }

