import {
  Injectable,
  Logger,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { firstValueFrom } from 'rxjs';
import { UserRole, CouponStatus, CouponDiscountType } from '@workspace/schemas';
import type {
  CouponResponseDTO,
  CouponCreateDTO,
  CouponUpdateDTO,
  CouponValidateRequestDTO,
  CouponValidateResponseDTO,
  CouponCalculateDiscountRequestDTO,
  CouponCalculateDiscountResponseDTO,
  CouponStatisticsDTO,
  PaginatedResponseDTO,
  Requester,
  CouponSearchRequestDTO,
} from '@workspace/schemas';

import type { ICouponService } from '@server/learning/interfaces/services';
import type { ICouponRepository } from '@server/learning/interfaces/repositories';
import { COUPON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';

/**
 * Coupon Service
 * Handles coupon business logic operations
 */
@Injectable()
export class CouponService implements ICouponService {
  private readonly logger = new Logger(CouponService.name);
  private readonly MINIMUM_ORDER_AMOUNT = 1000; // VND

  constructor(
    @Inject(COUPON_REPOSITORY_TOKEN)
    private readonly couponRepository: ICouponRepository,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  /**
   * Map Coupon entity to CouponResponseDTO
   */

  /**
   * Find all coupons with pagination and filtering
   */
  async findAll(
    dto: CouponSearchRequestDTO,
  ): Promise<PaginatedResponseDTO<CouponResponseDTO>> {
    try {
      const { page = 1, limit = 10, search, status } = dto;
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, coupons] = await Promise.all([
        this.couponRepository.count(where),
        this.couponRepository.findMany({
          skip,
          take: limitNum,
          where,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        data: this.mapper.mapArray(coupons, 'Coupon', 'CouponResponseDTO'),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve coupons', error);
      throw new BadRequestException('Failed to retrieve coupons');
    }
  }

  /**
   * Find one coupon by ID
   */
  async findById(couponId: string): Promise<CouponResponseDTO> {
    const coupon = await this.couponRepository.findById(couponId);

    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${couponId} not found`);
    }

    return this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO');
  }

  /**
   * Find coupon by code
   */
  async findByCode(code: string): Promise<CouponResponseDTO> {
    const coupon = await this.couponRepository.findByCode(code);

    if (!coupon) {
      throw new NotFoundException(`Coupon with code ${code} not found`);
    }

    return this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO');
  }

  /**
   * Create a new coupon
   */
  async create(
    requester: Requester,
    dto: CouponCreateDTO,
  ): Promise<CouponResponseDTO> {
    this.logger.log(
      `Creating coupon with requester role: ${requester.role} (sub: ${requester.sub})`,
    );

    // Check permissions (only ADMIN and STAFF* can create coupons)
    if (
      ![
        UserRole.ADMIN,
        UserRole.STAFF,
        UserRole.STAFF_FINANCE,
        UserRole.STAFF_SALES,
      ].includes(requester.role as UserRole)
    ) {
      this.logger.warn(
        `Permission denied. UserRole: ${requester.role} is not authorized`,
      );
      throw new ForbiddenException(
        'Only admins and authorized staff can create coupons',
      );
    }

    try {
      // Validate code uniqueness
      const codeExists = await this.couponRepository.codeExists(dto.code);
      if (codeExists) {
        throw new BadRequestException(`Coupon code ${dto.code} already exists`);
      }

      // Validate dates
      const validFrom =
        typeof dto.validFrom === 'string'
          ? new Date(dto.validFrom)
          : dto.validFrom;
      const validUntil =
        typeof dto.validUntil === 'string'
          ? new Date(dto.validUntil)
          : dto.validUntil;

      if (validUntil <= validFrom) {
        throw new BadRequestException('validUntil must be after validFrom');
      }

      // Validate discount value
      if (dto.discountValue <= 0) {
        throw new BadRequestException('Discount value must be greater than 0');
      }
      if (
        dto.discountType === CouponDiscountType.PERCENTAGE &&
        dto.discountValue > 100
      ) {
        throw new BadRequestException('Percentage discount cannot exceed 100%');
      }

      // Validate maxDiscountAmount: only applicable for PERCENTAGE type
      if (
        dto.maxDiscountAmount &&
        dto.discountType === CouponDiscountType.FIXED_AMOUNT
      ) {
        throw new BadRequestException(
          'maxDiscountAmount is only applicable for percentage discount type',
        );
      }
      if (
        dto.maxDiscountAmount &&
        dto.maxDiscountAmount !== null &&
        dto.maxDiscountAmount <= 0
      ) {
        throw new BadRequestException(
          'maxDiscountAmount must be greater than 0',
        );
      }

      // Validate usageLimit
      if (
        dto.usageLimit !== undefined &&
        dto.usageLimit !== null &&
        dto.usageLimit <= 0
      ) {
        throw new BadRequestException('Usage limit must be greater than 0');
      }

      // Validate userUsageLimit
      if (dto.userUsageLimit !== undefined && dto.userUsageLimit <= 0) {
        throw new BadRequestException(
          'User usage limit must be greater than 0',
        );
      }

      const coupon = await this.couponRepository.create({
        code: dto.code.toUpperCase(),
        name: dto.name,
        description: dto.description || null,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxDiscountAmount: dto.maxDiscountAmount || null,
        minOrderAmount: dto.minOrderAmount || null,
        applicableCourseMasterIds: dto.applicableCourseMasterIds || [],
        excludedCourseMasterIds: dto.excludedCourseMasterIds || [],
        validFrom,
        validUntil,
        usageLimit: dto.usageLimit || null,
        userUsageLimit: dto.userUsageLimit || 1,
        status: dto.status || CouponStatus.ACTIVE,
        creator: requester.sub ? { connect: { id: requester.sub } } : undefined,
      } as any);

      // Log Audit
      await this.logAudit({
        userId: requester.sub,
        action: 'coupon.create',
        entity: 'coupon',
        entityId: coupon.id,
        description: `Created coupon ${coupon.code}`,
        newValues: coupon,
      });

      return this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO');
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error('Failed to create coupon', error);
      throw new BadRequestException('Failed to create coupon');
    }
  }

  /**
   * Update coupon
   */
  async update(
    requester: Requester,
    couponId: string,
    dto: CouponUpdateDTO,
  ): Promise<CouponResponseDTO> {
    // Check permissions
    if (
      ![
        UserRole.ADMIN,
        UserRole.STAFF,
        UserRole.STAFF_FINANCE,
        UserRole.STAFF_SALES,
      ].includes(requester.role as UserRole)
    ) {
      throw new ForbiddenException(
        'Only admins and authorized staff can update coupons',
      );
    }

    const coupon = await this.couponRepository.findById(couponId);
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${couponId} not found`);
    }

    try {
      // If code is being updated, check uniqueness
      if (dto.code && dto.code !== coupon.code) {
        const codeExists = await this.couponRepository.codeExists(
          dto.code,
          couponId,
        );
        if (codeExists) {
          throw new BadRequestException(
            `Coupon code ${dto.code} already exists`,
          );
        }
      }

      // If coupon has usage, only allow editing name and description
      if (coupon.usageCount > 0) {
        const allowedFields = ['name', 'description'];
        const updateFields = Object.keys(dto);
        const disallowedFields = updateFields.filter(
          (field) => !allowedFields.includes(field),
        );

        if (disallowedFields.length > 0) {
          throw new BadRequestException(
            `Cannot update fields ${disallowedFields.join(', ')} after coupon has been used. Only name and description can be updated.`,
          );
        }
      }

      // Validate dates if being updated
      let validFrom = coupon.validFrom;
      let validUntil = coupon.validUntil;

      if (dto.validFrom) {
        validFrom =
          typeof dto.validFrom === 'string'
            ? new Date(dto.validFrom)
            : dto.validFrom;
      }
      if (dto.validUntil) {
        validUntil =
          typeof dto.validUntil === 'string'
            ? new Date(dto.validUntil)
            : dto.validUntil;
      }

      // Only validate if at least one date is being updated
      if (dto.validFrom || dto.validUntil) {
        if (validUntil <= validFrom) {
          throw new BadRequestException('validUntil must be after validFrom');
        }
      }

      // Validate discount value
      const discountValue = dto.discountValue ?? coupon.discountValue;
      const discountType = dto.discountType ?? coupon.discountType;
      if (Number(discountValue) <= 0) {
        throw new BadRequestException('Discount value must be greater than 0');
      }
      if (
        discountType === CouponDiscountType.PERCENTAGE &&
        Number(discountValue) > 100
      ) {
        throw new BadRequestException('Percentage discount cannot exceed 100%');
      }

      // Validate maxDiscountAmount: only applicable for PERCENTAGE type
      if (
        dto.maxDiscountAmount !== undefined &&
        (dto.discountType ?? coupon.discountType) ===
          CouponDiscountType.FIXED_AMOUNT
      ) {
        throw new BadRequestException(
          'maxDiscountAmount is only applicable for percentage discount type',
        );
      }
      if (
        dto.maxDiscountAmount !== undefined &&
        dto.maxDiscountAmount !== null &&
        dto.maxDiscountAmount <= 0
      ) {
        throw new BadRequestException(
          'maxDiscountAmount must be greater than 0',
        );
      }

      // Validate usageLimit: cannot be less than current usageCount
      if (
        dto.usageLimit !== undefined &&
        dto.usageLimit !== null &&
        dto.usageLimit < coupon.usageCount
      ) {
        throw new BadRequestException(
          `Usage limit (${dto.usageLimit}) cannot be less than current usage count (${coupon.usageCount})`,
        );
      }
      if (
        dto.usageLimit !== undefined &&
        dto.usageLimit !== null &&
        dto.usageLimit <= 0
      ) {
        throw new BadRequestException('Usage limit must be greater than 0');
      }

      // Validate userUsageLimit
      if (dto.userUsageLimit !== undefined && dto.userUsageLimit <= 0) {
        throw new BadRequestException(
          'User usage limit must be greater than 0',
        );
      }

      const updatedCoupon = await this.couponRepository.update(couponId, {
        code: dto.code ? dto.code.toUpperCase() : undefined,
        name: dto.name,
        description:
          dto.description !== undefined ? dto.description : undefined,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        maxDiscountAmount:
          dto.maxDiscountAmount !== undefined
            ? dto.maxDiscountAmount
            : undefined,
        minOrderAmount:
          dto.minOrderAmount !== undefined ? dto.minOrderAmount : undefined,
        applicableCourseMasterIds: dto.applicableCourseMasterIds,
        excludedCourseMasterIds: dto.excludedCourseMasterIds,
        applicableRunIds: dto.applicableRunIds, // Added
        excludedRunIds: dto.excludedRunIds, // Added
        validFrom: dto.validFrom ? validFrom : undefined,
        validUntil: dto.validUntil ? validUntil : undefined,
        usageLimit: dto.usageLimit !== undefined ? dto.usageLimit : undefined,
        userUsageLimit: dto.userUsageLimit,
        status: dto.status,
      } as any);

      // Log Audit
      await this.logAudit({
        userId: requester.sub,
        action: 'coupon.update',
        entity: 'coupon',
        entityId: couponId,
        description: `Updated coupon ${updatedCoupon.code}`,
        oldValues: coupon,
        newValues: updatedCoupon,
      });

      return this.mapper.map(updatedCoupon, 'Coupon', 'CouponResponseDTO');
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error('Failed to update coupon', error);
      throw new BadRequestException('Failed to update coupon');
    }
  }

  /**
   * Delete coupon
   */
  async delete(
    requester: Requester,
    couponId: string,
  ): Promise<{ message: string }> {
    // Check permissions
    if (
      ![UserRole.ADMIN, UserRole.STAFF].includes(requester.role as UserRole)
    ) {
      throw new ForbiddenException('Only admins and staff can delete coupons');
    }

    const coupon = await this.couponRepository.findById(couponId);
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${couponId} not found`);
    }

    try {
      await this.couponRepository.delete(couponId);

      // Log Audit
      await this.logAudit({
        userId: requester.sub,
        action: 'coupon.delete',
        entity: 'coupon',
        entityId: couponId,
        description: `Deleted coupon ${coupon.code}`,
        oldValues: coupon,
      });

      return { message: 'Coupon deleted successfully' };
    } catch (error: any) {
      this.logger.error('Failed to delete coupon', error);
      throw new BadRequestException('Failed to delete coupon');
    }
  }

  /**
   * Validate coupon for a course
   */
  async validateCoupon(
    request: CouponValidateRequestDTO,
  ): Promise<CouponValidateResponseDTO> {
    try {
      // 1. Find coupon
      const coupon = await this.couponRepository.findByCode(request.code);
      if (!coupon) {
        return {
          isValid: false,
          coupon: null,
          discountAmount: null,
          message: 'Coupon không tồn tại',
        };
      }

      // 2. Check status
      if (coupon.status !== CouponStatus.ACTIVE) {
        return {
          isValid: false,
          coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
          discountAmount: null,
          message: 'Coupon không còn hiệu lực',
        };
      }

      // 3. Check validity period
      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return {
          isValid: false,
          coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
          discountAmount: null,
          message: 'Coupon chưa đến/đã hết hạn',
        };
      }

      // 4. Check usage limit
      if (
        coupon.usageLimit !== null &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        return {
          isValid: false,
          coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
          discountAmount: null,
          message: 'Coupon đã hết số lượng',
        };
      }

      // 5. Check user usage limit (if userId is provided)
      if (request.userId) {
        const userUsageCount = await this.couponRepository.countUserUsage(
          coupon.id,
          request.userId,
        );
        if (userUsageCount >= coupon.userUsageLimit) {
          return {
            isValid: false,
            coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
            discountAmount: null,
            message: `Bạn đã sử dụng coupon này ${userUsageCount} lần (giới hạn: ${coupon.userUsageLimit} lần)`,
          };
        }
      }

      // 6. Get course/run info and determine base price
      let course: any;
      let courseRun: any;
      let basePrice = 0;

      if (request.courseRunId) {
        try {
          courseRun = await firstValueFrom(
            this.natsClient.send(
              { cmd: 'learning.courserun.findById' },
              { id: request.courseRunId },
            ),
          );
          if (courseRun) {
            basePrice = Number(courseRun.discountPrice ?? courseRun.price);
            if (
              !request.courseMasterId ||
              request.courseMasterId !== courseRun.courseMasterId
            ) {
              request.courseMasterId = courseRun.courseMasterId;
            }
          }
        } catch (error) {
          this.logger.error(
            `Failed to fetch course run ${request.courseRunId}`,
            error,
          );
        }
      }

      if (basePrice === 0 && request.courseMasterId) {
        try {
          course = await firstValueFrom(
            this.natsClient.send(
              { cmd: 'learning.coursemaster.findById' },
              { id: request.courseMasterId },
            ),
          );
          if (course) {
            basePrice = Number(course.price || 0);
          }
        } catch (error) {
          this.logger.error(
            `Failed to fetch course ${request.courseMasterId}`,
            error,
          );
        }
      }

      if (!courseRun && !course) {
        return {
          isValid: false,
          coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
          discountAmount: null,
          message: 'Không tìm thấy khóa học',
        };
      }

      // 7. Check free course
      if ((course && course.isFree) || basePrice === 0) {
        return {
          isValid: false,
          coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
          discountAmount: null,
          message: 'Khóa học miễn phí không cần coupon',
        };
      }

      // 8. Check applicability
      const isRestrictedByApplicable =
        coupon.applicableCourseMasterIds?.length > 0 ||
        coupon.applicableRunIds?.length > 0;
      if (isRestrictedByApplicable) {
        let isApplicable = false;
        if (
          request.courseRunId &&
          coupon.applicableRunIds?.includes(request.courseRunId)
        ) {
          isApplicable = true;
        } else if (
          request.courseMasterId &&
          coupon.applicableCourseMasterIds?.includes(request.courseMasterId)
        ) {
          isApplicable = true;
        }

        if (!isApplicable) {
          return {
            isValid: false,
            coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
            discountAmount: null,
            message: 'Coupon không áp dụng cho khóa học này',
          };
        }
      }

      // 9. Check exclusions
      if (
        request.courseRunId &&
        coupon.excludedRunIds?.includes(request.courseRunId)
      ) {
        return {
          isValid: false,
          coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
          discountAmount: null,
          message: 'Coupon này bị loại trừ cho đợt học này',
        };
      }
      if (
        request.courseMasterId &&
        coupon.excludedCourseMasterIds?.includes(request.courseMasterId)
      ) {
        return {
          isValid: false,
          coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
          discountAmount: null,
          message: 'Coupon này bị loại trừ cho khóa học này',
        };
      }

      // 10. Check min order amount
      if (coupon.minOrderAmount && basePrice < Number(coupon.minOrderAmount)) {
        return {
          isValid: false,
          coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
          discountAmount: null,
          message: `Đơn hàng tối thiểu ${coupon.minOrderAmount} VND`,
        };
      }

      // Calculate discount
      const discountResult = await this.calculateDiscount({
        couponId: coupon.id,
        courseMasterId: request.courseMasterId,
        courseRunId: request.courseRunId,
        basePrice,
      });

      return {
        isValid: true,
        coupon: this.mapper.map(coupon, 'Coupon', 'CouponResponseDTO'),
        discountAmount: discountResult.discountAmount,
        message: null,
      };
    } catch (error: any) {
      this.logger.error('Failed to validate coupon', error);
      return {
        isValid: false,
        coupon: null,
        discountAmount: null,
        message: 'Lỗi khi validate coupon',
      };
    }
  }

  /**
   * Calculate discount amount for a coupon
   */
  async calculateDiscount(
    request: CouponCalculateDiscountRequestDTO,
  ): Promise<CouponCalculateDiscountResponseDTO> {
    try {
      const coupon = await this.couponRepository.findById(request.couponId);
      if (!coupon) {
        return {
          discountAmount: 0,
          finalPrice: request.basePrice,
          isValid: false,
          message: 'Coupon không tồn tại',
        };
      }

      const now = new Date();
      if (coupon.status !== CouponStatus.ACTIVE) {
        return {
          discountAmount: 0,
          finalPrice: request.basePrice,
          isValid: false,
          message: 'Coupon không còn hiệu lực',
        };
      }

      if (now < coupon.validFrom || now > coupon.validUntil) {
        return {
          discountAmount: 0,
          finalPrice: request.basePrice,
          isValid: false,
          message: 'Coupon chưa đến/đã hết hạn',
        };
      }

      let basePrice = request.basePrice;
      if (basePrice === 0 && request.courseRunId) {
        try {
          const courseRun = await firstValueFrom(
            this.natsClient.send(
              { cmd: 'learning.courserun.findById' },
              { id: request.courseRunId },
            ),
          );
          if (courseRun)
            basePrice = Number(courseRun.discountPrice ?? courseRun.price);
        } catch (error) {
          this.logger.error(
            `Error fetching run price for discount calculation: ${error.message}`,
          );
        }
      }

      let discountAmount = 0;
      if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
        discountAmount = (basePrice * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(
            discountAmount,
            Number(coupon.maxDiscountAmount),
          );
        }
      } else {
        discountAmount = Math.min(Number(coupon.discountValue), basePrice);
      }

      const finalPrice = Math.max(0, basePrice - discountAmount);

      return {
        discountAmount,
        finalPrice,
        isValid: true,
        message: null,
      };
    } catch (error: any) {
      this.logger.error('Failed to calculate discount', error);
      return {
        discountAmount: 0,
        finalPrice: request.basePrice,
        isValid: false,
        message: 'Lỗi khi tính toán discount',
      };
    }
  }

  /**
   * Get coupon statistics
   */
  async getStatistics(): Promise<CouponStatisticsDTO> {
    try {
      const [totalCoupons, activeCoupons, expiredCoupons, totalUsage] =
        await Promise.all([
          this.couponRepository.count(),
          this.couponRepository.count({ status: CouponStatus.ACTIVE }),
          this.couponRepository.count({ status: CouponStatus.EXPIRED }),
          this.couponRepository.getTotalUsageCount(),
        ]);

      return {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsage,
        totalDiscountGiven: 0,
      };
    } catch (error: any) {
      this.logger.error('Failed to get coupon statistics', error);
      throw new BadRequestException('Failed to get coupon statistics');
    }
  }

  /**
   * Get available coupons for a course run
   */
  async getAvailableCoupons(courseRunId: string): Promise<CouponResponseDTO[]> {
    try {
      let courseMasterId: string | undefined;
      try {
        const courseRun = await firstValueFrom(
          this.natsClient.send(
            { cmd: 'learning.courserun.findById' },
            { id: courseRunId },
          ),
        );
        if (courseRun) courseMasterId = courseRun.courseMasterId;
      } catch (error) {
        this.logger.error(
          `Error fetching run ${courseRunId} for available coupons: ${error.message}`,
        );
      }

      const coupons = await this.couponRepository.findAvailableForCourse(
        courseMasterId,
        courseRunId,
      );
      return this.mapper.mapArray(coupons, 'Coupon', 'CouponResponseDTO');
    } catch (error: any) {
      this.logger.error(
        `Error getting available coupons: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Helper to log audit entries to Identity Service
   */
  private async logAudit(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    description: string;
    oldValues?: any;
    newValues?: any;
  }) {
    try {
      this.natsClient.emit(
        { cmd: 'identity.audit.log' },
        {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          description: data.description,
          oldValues: data.oldValues,
          newValues: data.newValues,
          timestamp: new Date(),
        },
      );
    } catch (error) {
      this.logger.error(`Failed to log audit for ${data.action}`, error);
    }
  }
}
