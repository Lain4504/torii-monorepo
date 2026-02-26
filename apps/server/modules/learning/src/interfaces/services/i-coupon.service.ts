import type {
    CouponResponseDTO,
    CouponCreateDTO,
    CouponUpdateDTO,
    CouponValidateRequestDTO,
    CouponValidateResponseDTO,
    CouponCalculateDiscountRequestDTO,
    CouponCalculateDiscountResponseDTO,
    CouponStatisticsDTO,
    PaginationOptionsDTO,
    PaginatedResponseDTO,
    Requester,
} from '@workspace/schemas';

/**
 * Coupon Service Interface
 * Defines the contract for coupon business logic operations
 */
export interface ICouponService {
    /**
     * Find all coupons with pagination and filtering
     */
    findAll(options: PaginationOptionsDTO & { status?: string; search?: string }): Promise<PaginatedResponseDTO<CouponResponseDTO>>;

    /**
     * Find one coupon by ID
     */
    findById(couponId: string): Promise<CouponResponseDTO>;

    /**
     * Find coupon by code
     */
    findByCode(code: string): Promise<CouponResponseDTO>;

    /**
     * Create a new coupon
     */
    create(requester: Requester, dto: CouponCreateDTO): Promise<CouponResponseDTO>;

    /**
     * Update coupon
     */
    update(requester: Requester, couponId: string, dto: CouponUpdateDTO): Promise<CouponResponseDTO>;

    /**
     * Delete coupon
     */
    delete(requester: Requester, couponId: string): Promise<{ message: string }>;

    /**
     * Validate coupon for a course
     */
    validateCoupon(request: CouponValidateRequestDTO): Promise<CouponValidateResponseDTO>;

    /**
     * Calculate discount amount for a coupon
     */
    calculateDiscount(request: CouponCalculateDiscountRequestDTO): Promise<CouponCalculateDiscountResponseDTO>;

    /**
     * Get coupon statistics
     */
    getStatistics(): Promise<CouponStatisticsDTO>;

    /**
     * Get available coupons for a course
     */
    getAvailableCoupons(courseId: string): Promise<CouponResponseDTO[]>;
}
