import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { ScheduleModule } from '@nestjs/schedule';
import { GlobalRpcExceptionFilter, SharedModule } from '@server/shared';
import { ContentModule } from '@server/academy/modules/content/content.module';
import { ClassroomModule } from '@server/academy/modules/classroom/classroom.module';
import { AssessmentModule } from '@server/academy/modules/assessment/assessment.module';
import { CommerceModule } from '@server/academy/modules/commerce/commerce.module';
import { TicketModule } from '@server/academy/modules/ticket/ticket.module';
import { StorageModule } from '@server/academy/modules/storage/storage.module';
import { BlogModule } from '@server/academy/modules/blog/blog.module';
import { GamificationModule } from '@server/academy/modules/gamification/gamification.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuditModule } from './modules/audit.module';
import { NoteModule } from './modules/note/note.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    ScheduleModule.forRoot(),
    SharedModule,
    AuditModule,
    ContentModule,
    ClassroomModule,
    AssessmentModule,
    CommerceModule,
    TicketModule,
    StorageModule,
    BlogModule,
    GamificationModule,
    InfrastructureModule,
    NoteModule,
    FlashcardModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class AcademyModule { }
