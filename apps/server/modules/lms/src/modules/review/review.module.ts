import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repository';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ReviewRepository, ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
