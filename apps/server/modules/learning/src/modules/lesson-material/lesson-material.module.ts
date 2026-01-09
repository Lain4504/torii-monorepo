import { Module } from '@nestjs/common';
import { NatsClientModule, SharedStorageModule } from '@server/shared';
import { LessonMaterialService } from './lesson-material.service';
import { LessonMaterialRepository } from './lesson-material.repository';
import { LESSON_MATERIAL_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { LESSON_MATERIAL_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * Lesson Material Feature Module
 * Handles lesson material upload and management
 */
@Module({
    imports: [SharedStorageModule, NatsClientModule],
    providers: [
        {
            provide: LESSON_MATERIAL_REPOSITORY_TOKEN,
            useClass: LessonMaterialRepository,
        },
        {
            provide: LESSON_MATERIAL_SERVICE_TOKEN,
            useClass: LessonMaterialService,
        },
    ],
    exports: [LESSON_MATERIAL_SERVICE_TOKEN, LESSON_MATERIAL_REPOSITORY_TOKEN],
})
export class LessonMaterialModule { }
