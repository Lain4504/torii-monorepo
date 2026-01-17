import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { CommentProfile } from '../../infrastructure/mappings/comment.profile';
import { PostRepository } from '../post/post.repository';
import { PostProfile } from '../../infrastructure/mappings/post.profile';

/**
 * Comment Feature Module
 * Handles comment operations
 */
@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [],
    providers: [CommentRepository, CommentService, CommentProfile, PostRepository, PostProfile],
    exports: [CommentService],
})
export class CommentModule { }
