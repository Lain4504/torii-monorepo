import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClassReviewService } from './class-review.service';
import type {
  ClassReviewCreateDto,
  ClassReviewUpdateDto,
  ClassReviewQueryDto,
  ClassReviewAdminQueryDto,
  ClassReviewModerateDto,
} from './dto/class-review.dto';

@Controller()
export class ClassReviewHandler {
  constructor(private readonly reviews: ClassReviewService) {}

  // ── Learner ─────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: 'academy.classReview.listByClass' })
  listByClass(
    @Payload() data: { classId: string; query: ClassReviewQueryDto },
  ) {
    return this.reviews.listClassReviews(data.classId, data.query);
  }

  @MessagePattern({ cmd: 'academy.classReview.listMine' })
  listMine(@Payload() data: { userId: string }) {
    return this.reviews.listMyReviews(data.userId);
  }

  @MessagePattern({ cmd: 'academy.classReview.create' })
  create(
    @Payload()
    data: {
      classId: string;
      userId: string;
      dto: ClassReviewCreateDto;
    },
  ) {
    return this.reviews.createReview(data.classId, data.userId, data.dto);
  }

  @MessagePattern({ cmd: 'academy.classReview.update' })
  update(
    @Payload()
    data: {
      id: string;
      userId: string;
      dto: ClassReviewUpdateDto;
      isAdmin?: boolean;
    },
  ) {
    return this.reviews.updateReview(
      data.id,
      data.userId,
      data.dto,
      data.isAdmin,
    );
  }

  @MessagePattern({ cmd: 'academy.classReview.hide' })
  hide(@Payload() data: { id: string; userId: string }) {
    return this.reviews.hideReview(data.id, data.userId);
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  @MessagePattern({ cmd: 'academy.classReview.adminList' })
  adminList(@Payload() query: ClassReviewAdminQueryDto) {
    return this.reviews.adminListReviews(query);
  }

  @MessagePattern({ cmd: 'academy.classReview.moderate' })
  moderate(
    @Payload()
    data: {
      id: string;
      moderatorId: string;
      dto: ClassReviewModerateDto;
    },
  ) {
    return this.reviews.moderateReview(data.id, data.moderatorId, data.dto);
  }
}
