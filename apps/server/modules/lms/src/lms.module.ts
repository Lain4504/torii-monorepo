import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, SharedModule } from '@server/shared';

import { CourseModule } from './modules/course/course.module';
import { ModuleModule } from './modules/module/module.module';
import { LessonModule } from './modules/lesson/lesson.module';

import { CourseController } from './interfaces/http/course.controller';
import { ModuleController } from './interfaces/http/module.controller';
import { LessonController } from './interfaces/http/lesson.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    PrismaModule,
    CourseModule,
    ModuleModule,
    LessonModule,
  ],
  controllers: [CourseController, ModuleController, LessonController],
})
export class LmsModule { }

