import { Module } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { DiscussionService } from './discussion.service';
import { DiscussionRepository } from './discussion.repository';

@Module({
    providers: [DiscussionService, DiscussionRepository, PrismaService],
    exports: [DiscussionService],
})
export class DiscussionModule { }
