import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostLikeService } from '../../modules/post/post-like.service';
import type { PostLikeDTO } from '@workspace/schemas';

@Controller()
export class PostLikeHandler {
    constructor(private readonly postLikeService: PostLikeService) { }

    @MessagePattern({ cmd: 'learning.post.like' })
    async likePost(@Payload() dto: PostLikeDTO) {
        return this.postLikeService.likePost(dto);
    }

    @MessagePattern({ cmd: 'learning.post.unlike' })
    async unlikePost(@Payload() dto: PostLikeDTO) {
        return this.postLikeService.unlikePost(dto);
    }

    @MessagePattern({ cmd: 'learning.post.getLikeCount' })
    async getPostLikeCount(@Payload() data: { postId: string }) {
        return this.postLikeService.getPostLikeCount(data.postId);
    }

    @MessagePattern({ cmd: 'learning.post.hasUserLiked' })
    async hasUserLikedPost(@Payload() data: { userId: string; postId: string }) {
        return this.postLikeService.hasUserLikedPost(data.userId, data.postId);
    }

    @MessagePattern({ cmd: 'learning.post.getLikes' })
    async getPostLikes(@Payload() data: { postId: string; page?: number; limit?: number }) {
        return this.postLikeService.getPostLikes(data.postId, data.page, data.limit);
    }
}
