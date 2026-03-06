import { Module } from '@nestjs/common';
import { NatsClientModule, PrismaModule } from '@server/shared';
import { GamificationModule } from '@server/academy/modules/gamification/gamification.module';
import { LearningProgressHandler } from './learning-progress.handler';
import { LearningProgressService } from './learning-progress.service';

@Module({
  imports: [PrismaModule, NatsClientModule, GamificationModule],
  providers: [LearningProgressService],
  controllers: [LearningProgressHandler],
})
export class LearningProgressModule { }

