import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { FeedRepository } from '@server/learning/modules/feed/feed.repository';
import { FeedService } from '@server/learning/modules/feed/feed.service';

@Module({
    imports: [PrismaModule],
    providers: [FeedRepository, FeedService],
    exports: [FeedService],
})
export class FeedModule { }
