import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogCommentService } from './blog-comment.service';
import {
  CreateBlogCommentDto,
  UpdateBlogCommentDto,
  BlogCommentQueryDto,
} from '@workspace/dtos';

@Controller()
export class BlogCommentController {
  constructor(private readonly blogCommentService: BlogCommentService) {}

  @MessagePattern({ cmd: 'blog.comment.create' })
  createComment(@Payload() dto: CreateBlogCommentDto) {
    return this.blogCommentService.createComment(dto);
  }

  @MessagePattern({ cmd: 'blog.comment.findAll' })
  findAllComments(@Payload() query: BlogCommentQueryDto) {
    return this.blogCommentService.findAllComments(query);
  }

  @MessagePattern({ cmd: 'blog.comment.findOne' })
  findCommentById(@Payload() id: string) {
    return this.blogCommentService.findCommentById(id);
  }

  @MessagePattern({ cmd: 'blog.comment.update' })
  updateComment(
    @Payload() data: { id: string; authorId: string; dto: UpdateBlogCommentDto },
  ) {
    return this.blogCommentService.updateComment(data.id, data.authorId, data.dto);
  }

  @MessagePattern({ cmd: 'blog.comment.delete' })
  deleteComment(@Payload() data: { id: string; authorId: string }) {
    return this.blogCommentService.deleteComment(data.id, data.authorId);
  }

  @MessagePattern({ cmd: 'blog.comment.getWithReplies' })
  getCommentWithReplies(@Payload() data: { commentId: string; depth?: number }) {
    return this.blogCommentService.getCommentWithReplies(data.commentId, data.depth);
  }
}
