import { Module } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { DiscussionService } from './discussion.service';
import { DiscussionRepository } from './discussion.repository';
import { DiscussionHandler } from '@server/learning/modules/discussion/discussion.handler';

@Module({controllers: [DiscussionHandler],
  
    providers: [DiscussionService, DiscussionRepository, PrismaService],
    exports: [DiscussionService],
})
export class DiscussionModule { }
