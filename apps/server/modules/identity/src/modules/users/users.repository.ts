import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { User, Prisma } from '@prisma/generated';
import type { IUsersRepository } from '../../interfaces/repositories';

/**
 * User Repository
 * Handles all database operations for User entity
 */
@Injectable()
export class UsersRepository implements IUsersRepository {
    private readonly logger = new Logger(UsersRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find user by ID
     */
    async findById(userId: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { identities: true },
        });
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { email },
        });
    }

    /**
     * Find all users with pagination and search
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        return this.prisma.user.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
            include: { identities: true },
        });
    }

    /**
     * Count users with optional filter
     */
    async count(where?: Prisma.UserWhereInput): Promise<number> {
        return this.prisma.user.count({ where });
    }

    /**
     * Create new user
     */
    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data,
        });
    }

    /**
     * Update user by ID
     */
    async update(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Update user by email
     */
    async updateByEmail(email: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { email },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Delete user (hard delete)
     */
    async delete(userId: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id: userId },
        });
    }

    /**
     * Soft delete user
     */
    async softDelete(userId: string): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Check if email exists
     */
    async emailExists(email: string): Promise<boolean> {
        const user = await this.findByEmail(email);
        return !!user;
    }

    /**
     * Get user basic info with specific fields
     */
    async getUserBasicInfo(userId: string): Promise<{
        id: string;
        email: string;
        displayName: string;
        role: string;
        xp: number;
        level: number;
        avatarUrl: string | null;
        userMetadata: Record<string, unknown> | null;
        verifiedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                xp: true,
                level: true,
                avatarUrl: true,
                userMetadata: true,
                verifiedAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return null;
        }

        // Ensure userMetadata is properly typed (Prisma Json type can be Prisma.JsonValue)
        const userMetadata = user.userMetadata
            ? (typeof user.userMetadata === 'object' && user.userMetadata !== null && !Array.isArray(user.userMetadata)
                ? user.userMetadata as Record<string, unknown>
                : null)
            : null;

        return {
            ...user,
            userMetadata,
        };
    }

    /**
     * Update email verification timestamp
     */
    async markEmailAsVerified(userId: string): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                verifiedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Find users by role
     */
    async findByRole(role: string): Promise<User[]> {
        return this.prisma.user.findMany({
            where: { role },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Count users by role
     */
    async countByRole(role: string): Promise<number> {
        return this.prisma.user.count({
            where: { role },
        });
    }
}
