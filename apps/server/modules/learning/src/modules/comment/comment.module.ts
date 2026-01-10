import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';

/**
 * Comment Feature Module
 * Handles comment operations
 */
@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [CommentRepository, CommentService],
    exports: [CommentService],
})
export class CommentModule { }
