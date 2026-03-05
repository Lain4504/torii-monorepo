import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Coupon, Prisma } from '@prisma/generated';
import type { ICouponRepository } from '@server/learning/interfaces/repositories';

/**
 * Coupon Repository
 * Handles all database operations for Coupon entity
 */
@Injectable()
export class CouponRepository implements ICouponRepository {
  private readonly logger = new Logger(CouponRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find coupon by ID (excluding soft-deleted)
   */
  async findById(couponId: string): Promise<Coupon | null> {
    return this.prisma.coupon.findFirst({
      where: {
        id: couponId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find coupon by code (excluding soft-deleted)
   */
  async findByCode(code: string): Promise<Coupon | null> {
    return this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        deletedAt: null,
      },
    });
  }

  /**
   * Find all coupons with pagination and filtering (excluding soft-deleted by default)
   */
  async findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.CouponWhereInput;
    orderBy?: Prisma.CouponOrderByWithRelationInput;
    include?: Prisma.CouponInclude;
  }): Promise<Coupon[]> {
    const where = {
      ...options.where,
      deletedAt: null, // Exclude soft-deleted by default
    };
    return this.prisma.coupon.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy || { createdAt: 'desc' },
      include: options.include,
    });
  }

  /**
   * Count coupons with optional filter (excluding soft-deleted by default)
   */
  async count(where?: Prisma.CouponWhereInput): Promise<number> {
    return this.prisma.coupon.count({
      where: {
        ...where,
        deletedAt: null, // Exclude soft-deleted by default
      },
    });
  }

  /**
   * Create new coupon
   */
  async create(data: Prisma.CouponCreateInput): Promise<Coupon> {
    return this.prisma.coupon.create({ data });
  }

  /**
   * Update coupon by ID
   */
  async update(
    couponId: string,
    data: Prisma.CouponUpdateInput,
  ): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete coupon (soft delete)
   */
  async delete(couponId: string): Promise<void> {
    // Check if coupon has been used
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        orders: {
          take: 1,
        },
      },
    });

    if (!coupon) {
      throw new Error(`Coupon with id ${couponId} not found`);
    }

    // Soft delete: set deletedAt timestamp
    await this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Check if coupon code exists (excluding soft-deleted)
   */
  async codeExists(code: string, excludeId?: string): Promise<boolean> {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return coupon !== null;
  }

  /**
   * Increment coupon usage count
   */
  async incrementUsageCount(couponId: string): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }

  /**
   * Decrement coupon usage count
   */
  async decrementUsageCount(couponId: string): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        usageCount: { decrement: 1 },
      },
    });
  }

  /**
   * Count user usage for a coupon (based on Order table)
   */
  async countUserUsage(couponId: string, userId: string): Promise<number> {
    return this.prisma.order.count({
      where: {
        couponId,
        userId,
        status: { in: ['completed', 'pending'] }, // Count both completed and pending orders
      },
    });
  }

  /**
   * Get total usage count across all coupons (aggregation, excluding soft-deleted)
   */
  async getTotalUsageCount(): Promise<number> {
    const result = await this.prisma.coupon.aggregate({
      where: {
        deletedAt: null,
      },
      _sum: {
        usageCount: true,
      },
    });
    return result._sum.usageCount || 0;
  }

  /**
   * Find expired coupons (excluding soft-deleted)
   */
  async findExpiredCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return this.prisma.coupon.findMany({
      where: {
        validUntil: { lt: now },
        status: { not: 'expired' },
        deletedAt: null, // Exclude soft-deleted coupons
      },
    });
  }

  /**
   * Update coupon status
   */
  async updateStatus(couponId: string, status: string): Promise<Coupon> {
    return this.prisma.coupon.update({
      where: { id: couponId },
      data: { status: status as any },
    });
  }

  /**
   * Find available coupons for a course (Master and Run)
   */
  async findAvailableForCourse(
    courseMasterId?: string,
    courseRunId?: string,
  ): Promise<Coupon[]> {
    const now = new Date();
    const where: Prisma.CouponWhereInput = {
      status: 'active' as any,
      deletedAt: null,
      validFrom: { lte: now },
      validUntil: { gte: now },
    };

    const conditions: Prisma.CouponWhereInput[] = [
      // No restrictions
      {
        AND: [
          { applicableCourseMasterIds: { isEmpty: true } },
          { applicableRunIds: { isEmpty: true } },
        ],
      },
    ];

    if (courseMasterId) {
      conditions.push({ applicableCourseMasterIds: { has: courseMasterId } });
    }

    if (courseRunId) {
      conditions.push({ applicableRunIds: { has: courseRunId } });
    }

    where.OR = conditions;

    // Exclude exclusions
    if (courseMasterId || courseRunId) {
      where.NOT = {
        OR: [
          ...(courseMasterId
            ? [{ excludedCourseMasterIds: { has: courseMasterId } }]
            : []),
          ...(courseRunId ? [{ excludedRunIds: { has: courseRunId } }] : []),
        ],
      };
    }

    const coupons = await this.prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Filter by usage count
    return coupons.filter(
      (c) => c.usageLimit === null || c.usageCount < c.usageLimit,
    );
  }
}
