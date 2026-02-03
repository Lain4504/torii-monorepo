import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { CommentProfile } from '../../infrastructure/mappings/comment.profile';
import { PostRepository } from '../post/post.repository';
import { PostProfile } from '../../infrastructure/mappings/post.profile';
import { CommentLikeService } from './comment-like.service';
import { CommentLikeHandler } from '../../interfaces/nats/comment-like.handler';

/**
 * Comment Feature Module
 * Handles comment operations
 */
@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [CommentLikeHandler],
    providers: [CommentRepository, CommentService, CommentProfile, PostRepository, PostProfile, CommentLikeService],
    exports: [CommentService, CommentLikeService],
})
export class CommentModule { }
