import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { QA, Prisma } from '@prisma/generated'; // Use generated client path

@Injectable()
export class QARepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.QACreateInput): Promise<QA> {
        return this.prisma.qA.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.QAWhereUniqueInput;
        where?: Prisma.QAWhereInput;
        orderBy?: Prisma.QAOrderByWithRelationInput;
    }): Promise<(QA & { author: any, _count: { likes: number, comments: number } })[]> {
        // @ts-ignore - Prisma types might not perfectly match with include
        return this.prisma.qA.findMany({
            ...params,
            include: {
                author: true,
                _count: {
                    select: { likes: true, comments: true },
                },
            },
        });
    }

    async count(where: Prisma.QAWhereInput): Promise<number> {
        return this.prisma.qA.count({ where });
    }

    async findById(id: string): Promise<(QA & { author: any, _count: { likes: number, comments: number } }) | null> {
        // @ts-ignore
        return this.prisma.qA.findUnique({
            where: { id },
            include: {
                author: true,
                _count: {
                    select: { likes: true, comments: true },
                },
            },
        });
    }

    async update(id: string, data: Prisma.QAUpdateInput): Promise<QA> {
        return this.prisma.qA.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<QA> {
        return this.prisma.qA.delete({
            where: { id },
        });
    }
}
