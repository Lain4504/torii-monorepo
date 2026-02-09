import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { FeedRepository } from './feed.repository';
import { FeedService } from './feed.service';

@Module({
    imports: [PrismaModule],
    providers: [FeedRepository, FeedService],
    exports: [FeedService],
})
export class FeedModule { }
