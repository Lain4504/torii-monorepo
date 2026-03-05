import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseProfileController } from './controllers/course-profile.controller';
import { CourseEditionController } from './controllers/course-edition.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [CourseProfileController, CourseEditionController],
})
export class AcademyModule {}

