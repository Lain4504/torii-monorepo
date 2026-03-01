import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { ReviewService } from '@server/learning/modules/review/review.service';
import { ReviewRepository } from '@server/learning/modules/review/review.repository';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { ReviewProfile } from '@server/learning/infrastructure/mappings/review.profile';

@Module({
  imports: [PrismaModule, EnrollmentModule],
  controllers: [],
  providers: [ReviewRepository, ReviewService, ReviewProfile],
  exports: [ReviewRepository, ReviewService],
})
export class ReviewModule { }
