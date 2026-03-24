import { Module } from '@nestjs/common';
import { CohortService } from './cohort.service';
import { CohortHandler } from './cohort.handler';

@Module({
  providers: [CohortService],
  controllers: [CohortHandler],
  exports: [CohortService],
})
export class CohortModule {}
