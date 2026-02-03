import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { PostProfile } from '../../infrastructure/mappings/post.profile';
import { PostAnalyticsService } from './post-analytics.service';
import { PostAnalyticsScheduler } from './post-analytics.scheduler';
import { PostLikeService } from './post-like.service';
import { PostLikeHandler } from '../../interfaces/nats/post-like.handler';

/**
 * Post Feature Module
 * Handles post operations
 */
@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [PostLikeHandler],
    providers: [PostRepository, PostService, PostProfile, PostAnalyticsService, PostAnalyticsScheduler, PostLikeService],
    exports: [PostService, PostAnalyticsService, PostLikeService],
})
export class PostModule { }
