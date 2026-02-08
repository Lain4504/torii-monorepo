import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { BlogService } from './blog.service';
import { BlogRepository } from './blog.repository';
import { BlogProfile } from '../../infrastructure/mappings/blog.profile';
import { BlogAnalyticsService } from './blog-analytics.service';
import { BlogAnalyticsScheduler } from './blog-analytics.scheduler';

/**
 * Blog Feature Module
 * Handles blog operations
 */
@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [],
    providers: [BlogRepository, BlogService, BlogProfile, BlogAnalyticsService, BlogAnalyticsScheduler],
    exports: [BlogService, BlogAnalyticsService],
})
export class BlogModule { }
