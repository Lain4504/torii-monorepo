import { Module } from '@nestjs/common';
import { CourseModule } from './course/course.module';
import { LessonModule } from './lesson/lesson.module';
import { ModuleModule } from './module/module.module';

@Module({
    imports: [
        CourseModule,
        LessonModule,
        ModuleModule,
    ],
})
export class LmsGatewayModule { }
