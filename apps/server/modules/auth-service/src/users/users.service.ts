import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { PaginatedResponseDto, FindAllUsersParamsDto, UserResponseDto } from '@workspace/dtos';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async findAll(params: FindAllUsersParamsDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        try {
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

            const totalPages = Math.ceil(total / limit);

            // Manual mapping
            const userDtos: UserResponseDto[] = users.map(user => ({
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl || '',
                phone: user.phone || '',
                role: 'learner', // Default role logic
                status: user.status || 'active',
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            }));

            return {
                success: true,
                message: `${userDtos.length} user(s) retrieved successfully`,
                error: '',
                data: userDtos,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve users',
                error: error?.message || 'An unexpected error occurred',
                data: [],
                meta: {
                    page: 0,
                    limit: 0,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false
                } // Mock empty response
            } as PaginatedResponseDto<UserResponseDto>; // Cast as temp fix for strict typing if DTO differs slightly
        }
    }
}
