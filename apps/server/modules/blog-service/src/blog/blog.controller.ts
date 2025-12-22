import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogService } from './blog.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostQueryDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  CreateTagDto,
  UpdateTagDto,
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

  @MessagePattern({ cmd: 'blog.post.findBySlug' })
  findPostBySlug(@Payload() slug: string) {
    return this.blogService.findPostBySlug(slug);
  }

  @MessagePattern({ cmd: 'blog.post.update' })
  updatePost(@Payload() data: { id: string; dto: UpdateBlogPostDto }) {
    return this.blogService.updatePost(data.id, data.dto);
  }

  @MessagePattern({ cmd: 'blog.post.delete' })
  deletePost(@Payload() id: string) {
    return this.blogService.deletePost(id);
  }

  @MessagePattern({ cmd: 'blog.post.addImage' })
  addImageToPost(@Payload() data: { postId: string; imageUrl: string }) {
    return this.blogService.addImageToPost(data.postId, data.imageUrl);
  }

  @MessagePattern({ cmd: 'blog.post.deleteImage' })
  deleteImageFromPost(@Payload() data: { postId: string; imageId: string }) {
    return this.blogService.deleteImageFromPost(data.postId, data.imageId);
  }

  // =========================
  // BLOG CATEGORY MESSAGE PATTERNS
  // =========================

  @MessagePattern({ cmd: 'blog.category.create' })
  createCategory(@Payload() dto: CreateBlogCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @MessagePattern({ cmd: 'blog.category.findAll' })
  findAllCategories() {
    return this.blogService.findAllCategories();
  }

  @MessagePattern({ cmd: 'blog.category.findOne' })
  findCategoryById(@Payload() id: string) {
    return this.blogService.findCategoryById(id);
  }

  @MessagePattern({ cmd: 'blog.category.update' })
  updateCategory(@Payload() data: { id: string; dto: UpdateBlogCategoryDto }) {
    return this.blogService.updateCategory(data.id, data.dto);
  }

  @MessagePattern({ cmd: 'blog.category.delete' })
  deleteCategory(@Payload() id: string) {
    return this.blogService.deleteCategory(id);
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

  @MessagePattern({ cmd: 'blog.tag.findOne' })
  findTagById(@Payload() id: string) {
    return this.blogService.findTagById(id);
  }

  @MessagePattern({ cmd: 'blog.tag.update' })
  updateTag(@Payload() data: { id: string; dto: UpdateTagDto }) {
    return this.blogService.updateTag(data.id, data.dto);
  }

  @MessagePattern({ cmd: 'blog.tag.delete' })
  deleteTag(@Payload() id: string) {
    return this.blogService.deleteTag(id);
  }
}



