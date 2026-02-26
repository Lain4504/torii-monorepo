import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DiscussionService } from '@server/learning/modules/discussion/discussion.service';
import {
    DiscussionTopicCreateDTO,
    DiscussionTopicQueryDTO,
} from '@workspace/schemas';

@Controller()
export class DiscussionHandler {
    constructor(private readonly discussionService: DiscussionService) { }

    @MessagePattern('discussion.create')
    async create(@Payload() data: { userId: string; dto: DiscussionTopicCreateDTO }) {
        return this.discussionService.createDiscussion(data.userId, data.dto);
    }

    @MessagePattern('discussion.findAll')
    async findAll(@Payload() data: { query: DiscussionTopicQueryDTO; userId?: string }) {
        return this.discussionService.findAllDiscussions(data.query, data.userId);
    }

    @MessagePattern('discussion.findById')
    async findById(@Payload() data: { id: string; userId?: string }) {
        return this.discussionService.findDiscussionById(data.id, data.userId);
    }

    @MessagePattern('discussion.delete')
    async delete(@Payload() data: { id: string; userId: string }) {
        return this.discussionService.deleteDiscussion(data.id, data.userId);
    }
}
