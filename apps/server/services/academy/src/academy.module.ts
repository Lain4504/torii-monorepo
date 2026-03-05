import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { GlobalRpcExceptionFilter, SharedModule } from '@server/shared';
import { ContentModule } from '@server/academy/modules/content/content.module';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    SharedModule,
    ContentModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
    },
  ],
})
export class AcademyModule {}
