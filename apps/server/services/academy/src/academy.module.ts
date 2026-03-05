import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { GlobalRpcExceptionFilter, SharedModule } from '@server/shared';
import { ContentModule } from '@server/academy/modules/content/content.module';
import { ClassroomModule } from '@server/academy/modules/classroom/classroom.module';
import { AssessmentModule } from '@server/academy/modules/assessment/assessment.module';
import { CommerceModule } from '@server/academy/modules/commerce/commerce.module';
import { TicketModule } from '@server/academy/modules/ticket/ticket.module';
import { StorageModule } from '@server/academy/modules/storage/storage.module';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    SharedModule,
    ContentModule,
    ClassroomModule,
    AssessmentModule,
    CommerceModule,
    TicketModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class AcademyModule { }
