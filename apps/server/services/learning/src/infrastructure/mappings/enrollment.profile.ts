import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Enrollment } from '@prisma/generated';
import type { EnrollmentResponseDTO } from '@workspace/schemas';

/**
 * Enrollment AutoMapper Profile
 * Maps Enrollment entity (Prisma) to EnrollmentResponseDTO
 */
@Injectable()
export class EnrollmentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap<Enrollment, EnrollmentResponseDTO>(
        mapper,
        'Enrollment',
        'EnrollmentResponseDTO',
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.userId,
          mapFrom((src) => src.userId),
        ),
        forMember(
          (dest) => dest.courseRunId,
          mapFrom((src) => src.courseRunId),
        ),
        forMember(
          (dest) => dest.versionId,
          mapFrom((src) => src.versionId || undefined),
        ),
        forMember(
          (dest) => dest.enrollmentDate,
          mapFrom((src) => src.enrollmentDate),
        ),
        forMember(
          (dest) => dest.completionStatus,
          mapFrom((src) => src.completionStatus as any),
        ),
        forMember(
          (dest) => dest.completionPercentage,
          mapFrom((src) => Number(src.completionPercentage)),
        ),
        forMember(
          (dest) => dest.lastAccessedAt,
          mapFrom((src) => src.lastAccessedAt || undefined),
        ),
        forMember(
          (dest) => dest.completedAt,
          mapFrom((src) => src.completedAt || undefined),
        ),
        forMember(
          (dest) => dest.paymentId,
          mapFrom((src) => src.paymentId || undefined),
        ),
        forMember(
          (dest) => dest.orderId,
          mapFrom((src: any) => src.orderId || undefined),
        ),
        forMember(
          (dest) => dest.couponAppliedId,
          mapFrom((src) => src.couponAppliedId || undefined),
        ),
        forMember(
          (dest) => dest.finalPrice,
          mapFrom((src) => Number(src.finalPrice)),
        ),
        forMember(
          (dest) => dest.isGift,
          mapFrom((src) => src.isGift || false),
        ),
        forMember(
          (dest) => dest.giftMessage,
          mapFrom((src) => src.giftMessage || undefined),
        ),
        forMember(
          (dest) => dest.senderId,
          mapFrom((src) => src.senderId || undefined),
        ),
        forMember(
          (dest) => dest.expiresAt,
          mapFrom((src) => src.expiresAt || undefined),
        ),
        forMember(
          (dest) => dest.createdAt,
          mapFrom((src) => src.createdAt),
        ),
        forMember(
          (dest) => dest.updatedAt,
          mapFrom((src) => src.updatedAt),
        ),
      );
    };
  }
}
