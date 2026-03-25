import { Module } from '@nestjs/common';
import { StudySetService } from './study-set.service';
import { StudySetHandler } from './study-set.handler';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { NatsClientModule } from '@server/shared';

@Module({
  imports: [InfrastructureModule, NatsClientModule],
  providers: [StudySetService],
  controllers: [StudySetHandler],
})
export class StudySetModule {}
