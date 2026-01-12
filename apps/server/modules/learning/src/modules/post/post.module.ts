import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { PostProfile } from '../../infrastructure/mappings/post.profile';

/**
 * Post Feature Module
 * Handles post operations
 */
@Module({
    imports: [PrismaModule],
    controllers: [],
    providers: [PostRepository, PostService, PostProfile],
    exports: [PostService],
})
export class PostModule { }
