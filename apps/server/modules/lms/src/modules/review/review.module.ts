import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { ReviewService } from './review.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}




