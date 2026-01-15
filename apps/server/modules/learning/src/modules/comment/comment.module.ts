import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { CommentProfile } from '../../infrastructure/mappings/comment.profile';

/**
 * Comment Feature Module
 * Handles comment operations
 */
@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [],
    providers: [CommentRepository, CommentService, CommentProfile],
    exports: [CommentService],
})
export class CommentModule { }
