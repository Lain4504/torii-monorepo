import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from '../../modules/review/review.service';
import {
  type ReviewCreateDTO,
  type ReviewQueryDTO,
  type PaginatedReviewResponseDTO,
  type RatingDistributionDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

@Controller('courses')
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name);

  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Get reviews by course ID
   * GET /api/courses/:courseId/reviews
   */
  @Get(':courseId/reviews')
  async getReviewsByCourse(
    @Param('courseId') courseId: string,
    @Query() query: ReviewQueryDTO,
  ): Promise<PaginatedReviewResponseDTO> {
    return await this.reviewService.findByCourseId(courseId, {
      ...query,
      courseId,
    });
  }

  /**
   * Get rating distribution for a course
   * GET /api/courses/:courseId/reviews/distribution
   */
  @Get(':courseId/reviews/distribution')
  async getRatingDistribution(
    @Param('courseId') courseId: string,
  ): Promise<RatingDistributionDTO> {
    return await this.reviewService.getRatingDistribution(courseId);
  }

  /**
   * Create a new review
   * POST /api/courses/:courseId/reviews
   */
  @Post(':courseId/reviews')
  @UseGuards(GatewayAuthGuard)
  async createReview(
    @Param('courseId') courseId: string,
    @Body() input: ReviewCreateDTO,
    @Req() req: any,
  ) {
    const userId = req.user?.uid || req.user?.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return await this.reviewService.create(userId, courseId, input);
  }

}

@Controller('reviews')
export class ReviewDeleteController {
  private readonly logger = new Logger(ReviewDeleteController.name);

  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Delete a review
   * DELETE /api/reviews/:id
   */
  @Delete(':id')
  @UseGuards(GatewayAuthGuard)
  async deleteReview(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.uid || req.user?.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return await this.reviewService.delete(id, userId);
  }
}

