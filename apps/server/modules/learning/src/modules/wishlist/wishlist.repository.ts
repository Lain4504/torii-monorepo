import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Wishlist, Prisma } from '@prisma/generated';
import type { IWishlistRepository } from '@server/learning/interfaces/repositories';

/**
 * Wishlist Repository
 * Handles all database operations for Wishlist entity
 */
@Injectable()
export class WishlistRepository implements IWishlistRepository {
    private readonly logger = new Logger(WishlistRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find wishlist by ID
     */
    async findById(id: string): Promise<Wishlist | null> {
        return this.prisma.wishlist.findUnique({
            where: { id },
        });
    }

    /**
     * Find wishlist by user and course run
     */
    async findByUserAndCourseRun(userId: string, courseRunId: string): Promise<Wishlist | null> {
        return this.prisma.wishlist.findUnique({
            where: {
                userId_courseRunId: {
                    userId,
                    courseRunId,
                },
            },
        });
    }

    /**
     * Find all wishlists with pagination and filters
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.WishlistWhereInput;
        orderBy?: Prisma.WishlistOrderByWithRelationInput;
    }): Promise<Wishlist[]> {
        return this.prisma.wishlist.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { addedAt: 'desc' },
        });
    }

    /**
     * Count wishlists with optional filter
     */
    async count(where?: Prisma.WishlistWhereInput): Promise<number> {
        return this.prisma.wishlist.count({
            where,
        });
    }

    /**
     * Create a new wishlist
     */
    async create(data: Prisma.WishlistCreateInput): Promise<Wishlist> {
        return this.prisma.wishlist.create({
            data,
        });
    }

    /**
     * Delete wishlist by ID
     */
    async delete(id: string): Promise<void> {
        await this.prisma.wishlist.delete({
            where: { id },
        });
    }
}


