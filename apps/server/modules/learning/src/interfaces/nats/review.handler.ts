import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReviewService } from '../../modules/review/review.service';
import { ReviewCreateDTO } from '@workspace/schemas';

@Controller()
export class ReviewHandler {
    constructor(private readonly reviewService: ReviewService) { }

    @MessagePattern({ cmd: 'learning.review.delete' })
    async delete(@Payload() data: { id: string, userId: string }) {
        return this.reviewService.delete(data.id, data.userId);
    }

    @MessagePattern({ cmd: 'learning.review.findByCourseId' })
    async findByCourseId(@Payload() data: { courseId: string, query: any }) {
        return this.reviewService.findByCourseId(data.courseId, {
            ...data.query,
            courseId: data.courseId,
        });
    }

    @MessagePattern({ cmd: 'learning.review.getRatingDistribution' })
    async getRatingDistribution(@Payload() data: { courseId: string }) {
        return this.reviewService.getRatingDistribution(data.courseId);
    }

    @MessagePattern({ cmd: 'learning.review.create' })
    async create(@Payload() data: ReviewCreateDTO & { courseId: string, userId: string }) {
        const { userId, courseId, ...dto } = data;
        return this.reviewService.create(userId, courseId, dto);
    }
}
