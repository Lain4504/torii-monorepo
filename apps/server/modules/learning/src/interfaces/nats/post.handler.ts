import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostService } from '../../modules/post/post.service';
import { PostCreateDTO, PostUpdateDTO, PostQueryDTO } from '@workspace/schemas';

@Controller()
export class PostHandler {
    constructor(private readonly postService: PostService) { }

    @MessagePattern({ cmd: 'learning.post.findAll' })
    async findAll(@Payload() query: PostQueryDTO) {
        return this.postService.findAllPosts(query);
    }

    @MessagePattern({ cmd: 'learning.post.findBySlug' })
    async findBySlug(@Payload() data: { slug: string }) {
        return this.postService.findPostBySlug(data.slug);
    }

    @MessagePattern({ cmd: 'learning.post.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.postService.findPostById(data.id);
    }

    @MessagePattern({ cmd: 'learning.post.incrementView' })
    async incrementView(@Payload() data: { id: string }) {
        return this.postService.incrementViewCount(data.id);
    }

    @MessagePattern({ cmd: 'learning.post.create' })
    async create(@Payload() data: PostCreateDTO) {
        return this.postService.createPost(data);
    }

    @MessagePattern({ cmd: 'learning.post.update' })
    async update(@Payload() data: { id: string, dto: PostUpdateDTO }) {
        return this.postService.updatePost(data.id, data.dto);
    }

    @MessagePattern({ cmd: 'learning.post.delete' })
    async delete(@Payload() data: { id: string }) {
        return this.postService.deletePost(data.id);
    }

    @MessagePattern({ cmd: 'learning.post.publish' })
    async publish(@Payload() data: { id: string }) {
        return this.postService.publishPost(data.id);
    }

    @MessagePattern({ cmd: 'learning.post.toggleLike' })
    async toggleLike(@Payload() data: { id: string, userId: string }) {
        return this.postService.toggleLike(data.id, data.userId);
    }
}
