import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FeedService } from '../../modules/feed/feed.service';
import { FeedCreateDTO, FeedQueryDTO } from '@workspace/schemas';

@Controller()
export class FeedHandler {
    constructor(private readonly feedService: FeedService) { }

    @MessagePattern('feed.create')
    async create(@Payload() data: { userId: string; dto: FeedCreateDTO }) {
        return this.feedService.createFeed(data.userId, data.dto);
    }

    @MessagePattern('feed.findAll')
    async findAll(@Payload() data: { query: FeedQueryDTO; userId?: string }) {
        return this.feedService.findAllFeeds(data.query, data.userId);
    }

    @MessagePattern('feed.findById')
    async findById(@Payload() data: { id: string; userId?: string }) {
        return this.feedService.findFeedById(data.id, data.userId);
    }

    @MessagePattern('feed.toggleLike')
    async toggleLike(@Payload() data: { id: string; userId: string }) {
        return this.feedService.toggleLike(data.id, data.userId);
    }

    @MessagePattern('feed.delete')
    async delete(@Payload() data: { id: string; userId: string }) {
        return this.feedService.deleteFeed(data.id, data.userId);
    }
}
