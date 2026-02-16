import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { ReviewService } from '@server/learning/modules/review/review.service';
import { ReviewRepository } from '@server/learning/modules/review/review.repository';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ReviewRepository, ReviewService],
  exports: [ReviewService],
})
export class ReviewModule { }
