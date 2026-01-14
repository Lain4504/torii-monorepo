import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { PostProfile } from '../../infrastructure/mappings/post.profile';
import { PostAnalyticsService } from './post-analytics.service';
import { PostAnalyticsScheduler } from './post-analytics.scheduler';

/**
 * Post Feature Module
 * Handles post operations
 */
@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [],
    providers: [PostRepository, PostService, PostProfile, PostAnalyticsService, PostAnalyticsScheduler],
    exports: [PostService, PostAnalyticsService],
})
export class PostModule { }
