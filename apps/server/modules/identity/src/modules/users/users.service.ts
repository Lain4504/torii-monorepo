import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
    ForbiddenException
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type {
    UserUpdateDTO,
    Requester,
} from '@workspace/schemas';
import {
    userUpdateDTOSchema,
    UserResponseDTO,
    UserRole,
    UserStatus,
    ErrEmailExisted,
    ErrUserNotFound,
} from '@workspace/schemas';
import { PrismaService } from '@server/shared';
import { RBACService } from '../rbac/rbac.service';

export interface CreateUserDTO {
    email: string;
    displayName: string;
    role?: UserRole;
    status?: UserStatus;
}

export interface PaginationOptions {
    page: number;
    limit: number;
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly rbacService: RBACService,
    ) { }

    /**
     * Find all users with pagination and search
     */
    async findAll(options: PaginationOptions): Promise<PaginatedResponse<UserResponseDTO>> {
        const { page = 1, limit = 10, search = '' } = options;
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { email: { contains: search, mode: 'insensitive' as any } },
                    { displayName: { contains: search, mode: 'insensitive' as any } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        // No need to filter fields - password/salt removed from schema
        const data = users.map(user => user as any);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Find one user by ID
     */
    async findOne(userId: string): Promise<UserResponseDTO> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user as any;
    }

    /**
     * Create new user (admin only)
     * Note: Firebase handles authentication, no password stored in DB
     */
    async create(dto: CreateUserDTO): Promise<UserResponseDTO> {
        // Check email exists
        const existingUser = await this.prisma.user.findFirst({ where: { email: dto.email } });
        if (existingUser) {
            throw new BadRequestException(ErrEmailExisted.message);
        }

        // Create user (Firebase handles password authentication)
        const newId = uuidv4();
        const user = await this.prisma.user.create({
            data: {
                id: newId,
                email: dto.email,
                displayName: dto.displayName,
                role: dto.role || UserRole.LEARNER,
                status: dto.status || UserStatus.ACTIVE,
            } as any,
        });

        return user as any;
    }

    /**
     * Get user profile
     */
    async profile(userId: string): Promise<UserResponseDTO> {
        return this.findOne(userId);
    }

    /**
   * Get user profile with RBAC data
   * Returns user info along with computed role, permissions, and staff template
   */
    async getUserProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                status: true,

                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException(ErrUserNotFound.message);
        }

        // Get permissions from RBAC service
        const rbacData = await this.rbacService.getUserPermissions(user.id, user.role);

        return {
            ...user,
            permissions: rbacData.permissions,
        };
    }

    /**
     * Update user
     * Note: Password changes handled by Firebase, not stored in DB
     */
    async update(requester: Requester, userId: string, dto: UserUpdateDTO): Promise<UserResponseDTO> {
        if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
            throw new ForbiddenException('Forbidden');
        }

        const data = userUpdateDTOSchema.parse(dto);

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update user data (password changes handled by Firebase)
        const updateData: any = { ...data };
        // Remove password field if present - Firebase handles auth
        delete updateData.password;

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { ...updateData, updatedAt: new Date() },
        });

        return updatedUser as any;
    }

    /**
     * Delete user (soft or hard delete)
     */
    async delete(requester: Requester, userId: string, hardDelete: boolean = false): Promise<{ message: string }> {
        if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
            throw new ForbiddenException('Forbidden');
        }

        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (hardDelete) {
            // Hard delete - permanently remove from database
            await this.prisma.user.delete({ where: { id: userId } });
            return { message: 'User permanently deleted' };
        } else {
            // Soft delete - mark as deleted
            await this.prisma.user.update({
                where: { id: userId },
                data: { status: UserStatus.DELETED, deletedAt: new Date(), updatedAt: new Date() } as any,
            });
            return { message: 'User soft deleted' };
        }
    }
}
