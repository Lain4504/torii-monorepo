import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentService } from '@server/learning/modules/comment/comment.service';
import {
  CommentCreateDTO,
  CommentUpdateDTO,
  CommentQueryDTO,
} from '@workspace/schemas';

@Controller()
export class CommentHandler {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern({ cmd: 'learning.comment.findAll' })
  async findAll(@Payload() data: CommentQueryDTO & { userId?: string }) {
    return this.commentService.findAllComments(data, data.userId);
  }

  @MessagePattern({ cmd: 'learning.comment.findById' })
  async findById(@Payload() data: { id: string }) {
    return this.commentService.findCommentById(data.id);
  }

  @MessagePattern({ cmd: 'learning.comment.getWithReplies' })
  async getWithReplies(@Payload() data: { id: string; depth?: number }) {
    return this.commentService.getCommentWithReplies(data.id, data.depth);
  }

  @MessagePattern({ cmd: 'learning.comment.create' })
  async create(@Payload() data: CommentCreateDTO & { userId: string }) {
    const dto: CommentCreateDTO = {
      ...data,
      userId: data.userId || (data as any).authorId, // Ensure userId is present
      authorId: data.authorId || data.userId,
    };

    return this.commentService.createComment(dto);
  }

  @MessagePattern({ cmd: 'learning.comment.update' })
  async update(
    @Payload() data: { id: string; dto: CommentUpdateDTO; userId: string },
  ) {
    return this.commentService.updateComment(data.id, data.userId, data.dto);
  }

  @MessagePattern({ cmd: 'learning.comment.delete' })
  async delete(@Payload() data: { id: string; userId: string }) {
    return this.commentService.deleteComment(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'learning.comment.toggleLike' })
  async toggleLike(@Payload() data: { id: string; userId: string }) {
    return this.commentService.toggleLike(data.id, data.userId);
  }
}
