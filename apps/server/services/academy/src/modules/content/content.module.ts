import { Module } from '@nestjs/common';
import { CourseProfileModule } from './course-profile/course-profile.module';
import { CourseEditionModule } from './course-edition/course-edition.module';
import { ChapterModule } from './chapter/chapter.module';
import { ChapterItemModule } from './chapter-item/chapter-item.module';
import { LessonModule } from './lesson/lesson.module';
import { QuizTemplateModule } from './quiz-template/quiz-template.module';
import { AssignmentTemplateModule } from './assignment-template/assignment-template.module';

@Module({
  imports: [
    CourseProfileModule,
    CourseEditionModule,
    ChapterModule,
    ChapterItemModule,
    LessonModule,
    QuizTemplateModule,
    AssignmentTemplateModule,
  ],
})
export class ContentModule {}

