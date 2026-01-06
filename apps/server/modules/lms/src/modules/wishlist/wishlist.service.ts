import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  type WishlistCreateDTO,
  type WishlistQueryDTO,
  type WishlistResponseDTO,
  type PaginatedResponseDTO,
} from '@workspace/schemas';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(private readonly prisma: PrismaService) {}

  private toWishlistDto(w: any): WishlistResponseDTO {
    return {
      id: w.id,
      userId: w.userId,
      courseId: w.courseId,
      addedAt: w.addedAt,
    };
  }

  async findAll(
    query: WishlistQueryDTO,
  ): Promise<PaginatedResponseDTO<WishlistResponseDTO>> {
    try {
      const { page = 1, limit = 10, userId, courseId } = query;
      const pageNum =
        typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const limitNum =
        typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const validPage = pageNum > 0 ? pageNum : 1;
      const validLimit = limitNum > 0 ? limitNum : 10;
      const skip = (validPage - 1) * validLimit;

      const whereClause: Record<string, any> = {};
      if (userId) whereClause.userId = userId;
      if (courseId) whereClause.courseId = courseId;

      const [total, items] = await Promise.all([
        this.prisma.wishlist.count({ where: whereClause }),
        this.prisma.wishlist.findMany({
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

  async findOne(id: string): Promise<WishlistResponseDTO | null> {
    try {
      const item = await this.prisma.wishlist.findUnique({ where: { id } });
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

  async create(input: WishlistCreateDTO): Promise<WishlistResponseDTO> {
    try {
      const created = await this.prisma.wishlist.create({
        data: { userId: input.userId, courseId: input.courseId },
      });
      return this.toWishlistDto(created);
    } catch (error: any) {
      // Handle unique constraint (userId + courseId) -> return existing
      if (error?.code === 'P2002') {
        const existing = await this.prisma.wishlist.findFirst({
          where: { userId: input.userId, courseId: input.courseId },
        });
        if (existing) return this.toWishlistDto(existing);
      }
      this.logger.error(
        `Error creating wishlist: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existing = await this.prisma.wishlist.findUnique({ where: { id } });
      if (!existing) return false;
      await this.prisma.wishlist.delete({ where: { id } });
      return true;
    } catch (error: any) {
      this.logger.error(
        `Error deleting wishlist ${id}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
