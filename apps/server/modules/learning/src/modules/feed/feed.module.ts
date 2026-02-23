import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { FeedRepository } from '@server/learning/modules/feed/feed.repository';
import { FeedService } from '@server/learning/modules/feed/feed.service';
import { FeedProfile } from '@server/learning/infrastructure/mappings/feed.profile';

@Module({
    imports: [PrismaModule],
    providers: [FeedRepository, FeedService, FeedProfile],
    exports: [FeedService],
})
export class FeedModule { }
