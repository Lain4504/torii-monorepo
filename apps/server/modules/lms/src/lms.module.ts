import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, SharedModule } from '@server/shared';

import { CourseModule } from './modules/course/course.module';
import { ModuleModule } from './modules/module/module.module';
import { LessonModule } from './modules/lesson/lesson.module';

import { CourseController } from './interfaces/http/course.controller';
import { ModuleController } from './interfaces/http/module.controller';
import { LessonController } from './interfaces/http/lesson.controller';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { WishlistController } from './interfaces/http/wishlist.controller';
import { ReviewModule } from './modules/review/review.module';
import { ReviewController, ReviewDeleteController } from './interfaces/http/review.controller';

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
    WishlistModule,
    ReviewModule,
  ],
  controllers: [CourseController, ModuleController, LessonController, WishlistController, ReviewController, ReviewDeleteController],
})
export class LmsModule { }

