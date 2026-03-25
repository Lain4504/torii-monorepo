import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { LearningPathController } from './controllers/learning-path.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [LearningPathController],
  providers: [],
})
export class LearningPathModule {}

