import { Injectable, Logger } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import {
  type WishlistCreateDTO,
  type WishlistQueryDTO,
  type WishlistResponseDTO,
  type PaginatedResponseDTO,
} from '@workspace/schemas';
import type { IWishlistService } from '@server/learning/interfaces/services';
import { WishlistRepository } from '@server/learning/modules/wishlist/wishlist.repository';
import type { Prisma } from '@prisma/generated';

/**
 * Wishlist Service
 * Handles wishlist business logic operations
 */
@Injectable()
export class WishlistService implements IWishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  private toWishlistDto(w: any): WishlistResponseDTO {
    return this.mapper.map<any, WishlistResponseDTO>(w, 'Wishlist', 'WishlistResponseDTO');
  }

  /**
   * Find all wishlists with pagination and filters
   */
  async findAll(
    query: WishlistQueryDTO,
  ): Promise<PaginatedResponseDTO<WishlistResponseDTO>> {
    try {
      const { page = 1, limit = 10, userId, courseRunId } = query;
      const pageNum =
        typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const limitNum =
        typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const validPage = pageNum > 0 ? pageNum : 1;
      const validLimit = limitNum > 0 ? limitNum : 10;
      const skip = (validPage - 1) * validLimit;

      const whereClause: Prisma.WishlistWhereInput = {};
      if (userId) whereClause.userId = userId;
      if (courseRunId) whereClause.courseRunId = courseRunId;

      const [total, items] = await Promise.all([
        this.wishlistRepository.count(whereClause),
        this.wishlistRepository.findMany({
          where: whereClause,
          take: validLimit,
          skip,
          orderBy: { addedAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / validLimit);

      return {
        data: items.map((i) => this.toWishlistDto(i)),
        total,
        page: validPage,
        limit: validLimit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error(
        `Error fetching wishlists: ${error.message}`,
        error.stack,
      );
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  }

  /**
   * Find wishlist by ID
   */
  async findById(id: string): Promise<WishlistResponseDTO | null> {
    try {
      const item = await this.wishlistRepository.findById(id);
      if (!item) return null;
      return this.toWishlistDto(item);
    } catch (error: any) {
      this.logger.error(
        `Error fetching wishlist ${id}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Create a new wishlist
   */
  async create(userId: string, input: WishlistCreateDTO): Promise<WishlistResponseDTO> {
    const { courseRunId } = input;
    if (!userId) throw new Error('UserId is required');
    if (!courseRunId) throw new Error('CourseRunId is required');

    try {
      const created = await this.wishlistRepository.create({
        user: { connect: { id: userId } },
        courseRun: { connect: { id: courseRunId } },
      } as any);
      return this.toWishlistDto(created);
    } catch (error: any) {
      // Handle unique constraint (userId + courseRunId) -> return existing
      if (error?.code === 'P2002') {
        const existing = await this.wishlistRepository.findByUserAndCourseRun(
          userId,
          courseRunId,
        );
        if (existing) return this.toWishlistDto(existing);
      }
      this.logger.error(
        `Error creating wishlist: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete wishlist by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const existing = await this.wishlistRepository.findById(id);
      if (!existing) return false;
      await this.wishlistRepository.delete(id);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Error deleting wishlist ${id}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Toggle wishlist (add if not exists, remove if exists)
   */
  async toggle(userId: string, courseRunId: string): Promise<{ isInWishlist: boolean; wishlist?: WishlistResponseDTO }> {
    try {
      const existing = await this.wishlistRepository.findByUserAndCourseRun(userId, courseRunId);

      if (existing) {
        // Remove from wishlist
        await this.wishlistRepository.delete(existing.id);
        return { isInWishlist: false };
      } else {
        // Add to wishlist
        const created = await this.wishlistRepository.create({
          user: { connect: { id: userId } },
          courseRun: { connect: { id: courseRunId } },
        } as any);
        return { isInWishlist: true, wishlist: this.toWishlistDto(created) };
      }
    } catch (error: any) {
      this.logger.error(
        `Error toggling wishlist: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if course run is in user's wishlist
   */
  async isInWishlist(userId: string, courseRunId: string): Promise<boolean> {
    try {
      const existing = await this.wishlistRepository.findByUserAndCourseRun(userId, courseRunId);
      return existing !== null;
    } catch (error: any) {
      this.logger.error(
        `Error checking wishlist: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}

