import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { FindAllUsersRequest, FindAllUsersResponse } from '@workspace/protocol';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(params: FindAllUsersRequest): Promise<FindAllUsersResponse> {
        const { page = 1, limit = 10, search } = params;
        const skip = (page - 1) * limit;

        const whereClause: any = {};
        if (search) {
            whereClause.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [total, users] = await Promise.all([
            this.prisma.user.count({ where: whereClause }),
            this.prisma.user.findMany({
                take: limit,
                skip: skip,
                where: whereClause,
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            data: users.map(u => ({
                id: u.id,
                email: u.email,
                fullName: u.fullName,
                avatarUrl: u.avatarUrl || '', // Proto requires string, DB provides nullable string
                phone: u.phone || '',       // Proto requires string, DB provides nullable string
                role: 'learner',
                status: u.status || 'active',
                createdAt: u.createdAt?.toISOString() || '',
                updatedAt: u.updatedAt?.toISOString() || '',
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    }
}

