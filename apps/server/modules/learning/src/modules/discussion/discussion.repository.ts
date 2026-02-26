import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { DiscussionTopic, Prisma } from '@prisma/generated';

@Injectable()
export class DiscussionRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.DiscussionTopicCreateInput): Promise<DiscussionTopic> {
        return this.prisma.discussionTopic.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.DiscussionTopicWhereUniqueInput;
        where?: Prisma.DiscussionTopicWhereInput;
        orderBy?: Prisma.DiscussionTopicOrderByWithRelationInput;
    }): Promise<(DiscussionTopic & { author: any })[]> {
        return this.prisma.discussionTopic.findMany({
            ...params,
            include: {
                author: true,
                // Note: likeCount and commentCount are now fields in the model, so we don't strictly need _count if we keep them updated
                // But for now, we rely on the fields.
            },
        });
    }

    async count(where: Prisma.DiscussionTopicWhereInput): Promise<number> {
        return this.prisma.discussionTopic.count({ where });
    }

    async findById(id: string): Promise<(DiscussionTopic & { author: any }) | null> {
        return this.prisma.discussionTopic.findUnique({
            where: { id },
            include: {
                author: true,
            },
        });
    }

    async update(id: string, data: Prisma.DiscussionTopicUpdateInput): Promise<DiscussionTopic> {
        return this.prisma.discussionTopic.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<DiscussionTopic> {
        return this.prisma.discussionTopic.delete({
            where: { id },
        });
    }
}
