import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';

/**
 * Post Feature Module
 * Handles post operations
 */
@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [PostRepository, PostService],
    exports: [PostService],
})
export class PostModule { }
