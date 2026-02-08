import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { Feed, Prisma } from '@prisma/generated'; // Use generated client path

@Injectable()
export class FeedRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.FeedCreateInput): Promise<Feed> {
        return this.prisma.feed.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.FeedWhereUniqueInput;
        where?: Prisma.FeedWhereInput;
        orderBy?: Prisma.FeedOrderByWithRelationInput;
    }): Promise<(Feed & { author: any, _count: { likes: number } })[]> {
        // @ts-ignore - Prisma types might not perfectly match with include
        return this.prisma.feed.findMany({
            ...params,
            include: {
                author: true,
                _count: {
                    select: { likes: true },
                },
            },
        });
    }

    async count(where: Prisma.FeedWhereInput): Promise<number> {
        return this.prisma.feed.count({ where });
    }

    async findById(id: string): Promise<(Feed & { author: any, _count: { likes: number } }) | null> {
        // @ts-ignore
        return this.prisma.feed.findUnique({
            where: { id },
            include: {
                author: true,
                _count: {
                    select: { likes: true },
                },
            },
        });
    }

    async update(id: string, data: Prisma.FeedUpdateInput): Promise<Feed> {
        return this.prisma.feed.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Feed> {
        return this.prisma.feed.delete({
            where: { id },
        });
    }
}
