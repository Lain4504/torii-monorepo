import { Module } from '@nestjs/common';
import { NatsClientModule, PrismaModule } from '@server/shared';
import { LearningPathController } from './controllers/learning-path.controller';

@Module({
  imports: [NatsClientModule, PrismaModule],
  controllers: [LearningPathController],
  providers: [],
})
export class LearningPathModule {}

