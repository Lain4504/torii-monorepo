import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared/prisma/prisma.module';
import { ClassReviewService } from './class-review.service';
import { ClassReviewHandler } from './class-review.handler';
import { GamificationModule } from '../../gamification/gamification.module';
import { ClassReviewListener } from './class-review.listener';

@Module({
  imports: [PrismaModule, GamificationModule],
  providers: [ClassReviewService],
  controllers: [ClassReviewHandler, ClassReviewListener],
  exports: [ClassReviewService],
})
export class ClassReviewModule {}
