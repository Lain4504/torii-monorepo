import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseProfileController } from './controllers/course-profile.controller';
import { CourseEditionController } from './controllers/course-edition.controller';
import { CourseOfferingController } from './controllers/course-offering.controller';
import { ChapterController } from './controllers/chapter.controller';
import { ChapterItemController } from './controllers/chapter-item.controller';
import { TicketController } from './controllers/ticket.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [
    CourseProfileController,
    CourseEditionController,
    CourseOfferingController,
    ChapterController,
    ChapterItemController,
    TicketController,
  ],
})
export class AcademyModule { }

