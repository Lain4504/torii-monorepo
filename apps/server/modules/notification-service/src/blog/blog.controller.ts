import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogService } from './blog.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostQueryDto,
  CreateBlogCommentDto,
  UpdateBlogCommentDto,
  BlogCommentQueryDto,
} from '@workspace/dtos';

@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // =========================
  // BLOG POST MESSAGE PATTERNS
  // =========================

  @MessagePattern({ cmd: 'blog.post.create' })
  createPost(@Payload() dto: CreateBlogPostDto) {
    return this.blogService.createPost(dto);
  }

  @MessagePattern({ cmd: 'blog.post.findAll' })
  findAllPosts(@Payload() query: BlogPostQueryDto) {
    return this.blogService.findAllPosts(query);
  }

  @MessagePattern({ cmd: 'blog.post.findOne' })
  findPostById(@Payload() id: string) {
    return this.blogService.findPostById(id);
  }

  @MessagePattern({ cmd: 'blog.post.update' })
  updatePost(@Payload() data: { id: string; dto: UpdateBlogPostDto }) {
    return this.blogService.updatePost(data.id, data.dto);
  }

  @MessagePattern({ cmd: 'blog.post.delete' })
  deletePost(@Payload() id: string) {
    return this.blogService.deletePost(id);
  }

  // =========================
  // BLOG COMMENT MESSAGE PATTERNS
  // =========================

  @MessagePattern({ cmd: 'blog.comment.create' })
  createComment(@Payload() dto: CreateBlogCommentDto) {
    return this.blogService.createComment(dto);
  }

  @MessagePattern({ cmd: 'blog.comment.findAll' })
  findAllComments(@Payload() query: BlogCommentQueryDto) {
    return this.blogService.findAllComments(query);
  }

  @MessagePattern({ cmd: 'blog.comment.findOne' })
  findCommentById(@Payload() id: string) {
    return this.blogService.findCommentById(id);
  }

  @MessagePattern({ cmd: 'blog.comment.update' })
  updateComment(
    @Payload() data: { id: string; authorId: string; dto: UpdateBlogCommentDto },
  ) {
    return this.blogService.updateComment(data.id, data.authorId, data.dto);
  }

  @MessagePattern({ cmd: 'blog.comment.delete' })
  deleteComment(@Payload() data: { id: string; authorId: string }) {
    return this.blogService.deleteComment(data.id, data.authorId);
  }

  @MessagePattern({ cmd: 'blog.comment.getWithReplies' })
  getCommentWithReplies(@Payload() data: { commentId: string; depth?: number }) {
    return this.blogService.getCommentWithReplies(data.commentId, data.depth);
  }

}



