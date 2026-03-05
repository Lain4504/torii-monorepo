import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewService } from '@server/learning/modules/review/review.service';
import { ReviewCreateDTO } from '@workspace/schemas';

@Controller()
export class ReviewHandler {
  constructor(private readonly reviewService: ReviewService) {}

  @MessagePattern({ cmd: 'learning.review.delete' })
  async delete(@Payload() data: { id: string; userId: string }) {
    return this.reviewService.delete(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'learning.review.findByCourseId' })
  async findByCourseId(
    @Payload() data: { courseMasterId: string; query: any },
  ) {
    return this.reviewService.findByCourseId(data.courseMasterId, {
      ...data.query,
      courseMasterId: data.courseMasterId,
    });
  }

  @MessagePattern({ cmd: 'learning.review.findAll' })
  async findAll(@Payload() data: { query: any }) {
    return this.reviewService.findAll(data.query);
  }

  @MessagePattern({ cmd: 'learning.review.getRatingDistribution' })
  async getRatingDistribution(@Payload() data: { courseMasterId: string }) {
    return this.reviewService.getRatingDistribution(data.courseMasterId);
  }

  @MessagePattern({ cmd: 'learning.review.create' })
  async create(@Payload() data: ReviewCreateDTO & { userId: string }) {
    const { userId, ...dto } = data;
    return this.reviewService.create(userId, dto);
  }

  @MessagePattern({ cmd: 'learning.review.findById' })
  async findById(@Payload() data: { id: string }) {
    return this.reviewService.findById(data.id);
  }
}
