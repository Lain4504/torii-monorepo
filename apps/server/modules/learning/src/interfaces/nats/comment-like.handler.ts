import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentLikeService } from '../../modules/comment/comment-like.service';
import type { CommentLikeDTO } from '@workspace/schemas';

@Controller()
export class CommentLikeHandler {
    constructor(private readonly commentLikeService: CommentLikeService) { }

    @MessagePattern({ cmd: 'learning.comment.like' })
    async likeComment(@Payload() dto: CommentLikeDTO) {
        return this.commentLikeService.likeComment(dto);
    }

    @MessagePattern({ cmd: 'learning.comment.unlike' })
    async unlikeComment(@Payload() dto: CommentLikeDTO) {
        return this.commentLikeService.unlikeComment(dto);
    }

    @MessagePattern({ cmd: 'learning.comment.getLikeCount' })
    async getCommentLikeCount(@Payload() data: { commentId: string }) {
        return this.commentLikeService.getCommentLikeCount(data.commentId);
    }

    @MessagePattern({ cmd: 'learning.comment.hasUserLiked' })
    async hasUserLikedComment(@Payload() data: { userId: string; commentId: string }) {
        return this.commentLikeService.hasUserLikedComment(data.userId, data.commentId);
    }

    @MessagePattern({ cmd: 'learning.comment.getLikes' })
    async getCommentLikes(@Payload() data: { commentId: string; page?: number; limit?: number }) {
        return this.commentLikeService.getCommentLikes(data.commentId, data.page, data.limit);
    }
}
