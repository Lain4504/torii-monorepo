import type { Coupon, Prisma } from '@prisma/generated';

/**
 * Coupon Repository Interface
 * Defines the contract for Coupon data access operations
 */
export interface ICouponRepository {
    /**
     * Find coupon by ID
     */
    findById(couponId: string): Promise<Coupon | null>;

    /**
     * Find coupon by code
     */
    findByCode(code: string): Promise<Coupon | null>;

    /**
     * Find all coupons with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CouponWhereInput;
        orderBy?: Prisma.CouponOrderByWithRelationInput;
        include?: Prisma.CouponInclude;
    }): Promise<Coupon[]>;

    /**
     * Count coupons with optional filter
     */
    count(where?: Prisma.CouponWhereInput): Promise<number>;

    /**
     * Create new coupon
     */
    create(data: Prisma.CouponCreateInput): Promise<Coupon>;

    /**
     * Update coupon by ID
     */
    update(couponId: string, data: Prisma.CouponUpdateInput): Promise<Coupon>;

    /**
     * Delete coupon (hard delete)
     */
    delete(couponId: string): Promise<void>;

    /**
     * Check if coupon code exists
     */
    codeExists(code: string, excludeId?: string): Promise<boolean>;

    /**
     * Increment coupon usage count
     */
    incrementUsageCount(couponId: string): Promise<Coupon>;

    /**
     * Decrement coupon usage count
     */
    decrementUsageCount(couponId: string): Promise<Coupon>;

    /**
     * Count user usage for a coupon (based on Order table)
     */
    countUserUsage(couponId: string, userId: string): Promise<number>;

    /**
     * Get total usage count across all coupons (aggregation)
     */
    getTotalUsageCount(): Promise<number>;

    /**
     * Find expired coupons
     */
    findExpiredCoupons(): Promise<Coupon[]>;

    /**
     * Update coupon status
     */
    updateStatus(couponId: string, status: string): Promise<Coupon>;
}
