import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogService } from './blog.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostQueryDto,
  CreateTagDto,
  TagQueryDto,
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
  // TAG MESSAGE PATTERNS
  // =========================

  @MessagePattern({ cmd: 'blog.tag.create' })
  createTag(@Payload() dto: CreateTagDto) {
    return this.blogService.createTag(dto);
  }

  @MessagePattern({ cmd: 'blog.tag.findAll' })
  findAllTags(@Payload() query: TagQueryDto) {
    return this.blogService.findAllTags(query);
  }
}


