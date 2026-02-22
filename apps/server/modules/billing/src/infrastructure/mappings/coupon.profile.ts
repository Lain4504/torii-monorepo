import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Coupon } from '@prisma/generated';
import type { CouponResponseDTO } from '@workspace/schemas';
import { CouponStatus, CouponDiscountType } from '@workspace/schemas';

/**
 * Coupon AutoMapper Profile (Billing)
 * Maps Coupon entity (Prisma) to CouponResponseDTO
 */
@Injectable()
export class CouponProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                'Coupon',
                'CouponResponseDTO',
                forMember(
                    (dest: CouponResponseDTO) => dest.id,
                    mapFrom((src: Coupon) => src.id),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.code,
                    mapFrom((src: Coupon) => src.code),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.name,
                    mapFrom((src: Coupon) => src.name),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.description,
                    mapFrom((src: Coupon) => src.description || undefined),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.discountType,
                    mapFrom((src: Coupon) => src.discountType as CouponDiscountType),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.discountValue,
                    mapFrom((src: Coupon) => Number(src.discountValue)),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.maxDiscountAmount,
                    mapFrom((src: Coupon) => src.maxDiscountAmount ? Number(src.maxDiscountAmount) : undefined),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.minOrderAmount,
                    mapFrom((src: Coupon) => src.minOrderAmount ? Number(src.minOrderAmount) : undefined),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.applicableCourseIds,
                    mapFrom((src: Coupon) => src.applicableCourseIds || []),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.excludedCourseIds,
                    mapFrom((src: Coupon) => src.excludedCourseIds || []),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.validFrom,
                    mapFrom((src: Coupon) => src.validFrom),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.validUntil,
                    mapFrom((src: Coupon) => src.validUntil),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.usageLimit,
                    mapFrom((src: Coupon) => src.usageLimit || undefined),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.usageCount,
                    mapFrom((src: Coupon) => src.usageCount),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.userUsageLimit,
                    mapFrom((src: Coupon) => src.userUsageLimit),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.status,
                    mapFrom((src: Coupon) => src.status as CouponStatus),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.createdBy,
                    mapFrom((src: Coupon) => src.createdBy || undefined),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.createdAt,
                    mapFrom((src: Coupon) => src.createdAt),
                ),
                forMember(
                    (dest: CouponResponseDTO) => dest.updatedAt,
                    mapFrom((src: Coupon) => src.updatedAt),
                ),
            );
        };
    }
}
