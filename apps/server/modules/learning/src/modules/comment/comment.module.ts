import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { CommentService } from '@server/learning/modules/comment/comment.service';
import { CommentRepository } from '@server/learning/modules/comment/comment.repository';
import { CommentProfile } from '@server/learning/infrastructure/mappings/comment.profile';
import { BlogRepository } from '@server/learning/modules/blog/blog.repository';
import { BlogProfile } from '@server/learning/infrastructure/mappings/blog.profile';

/**
 * Comment Feature Module
 * Handles comment operations
 */
@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [],
    providers: [CommentRepository, CommentService, CommentProfile, BlogRepository, BlogProfile],
    exports: [CommentService],
})
export class CommentModule { }

