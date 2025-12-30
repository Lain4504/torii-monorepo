import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@server/shared';

import { CourseModule } from './modules/course/course.module';
import { ModuleModule } from './modules/module/module.module';
import { LessonModule } from './modules/lesson/lesson.module';

import { CourseController } from './interfaces/nats/course.controller';
import { ModuleController } from './interfaces/nats/module.controller';
import { LessonController } from './interfaces/nats/lesson.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CourseModule,
    ModuleModule,
    LessonModule,
  ],
  controllers: [CourseController, ModuleController, LessonController],
})
export class LmsModule { }

