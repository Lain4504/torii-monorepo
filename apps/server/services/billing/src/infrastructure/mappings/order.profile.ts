import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Order } from '@prisma/generated';
import type { OrderResponseDTO } from '@workspace/schemas';
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentGateway,
} from '@workspace/schemas';

/**
 * Order AutoMapper Profile
 * Maps Order entity (Prisma) to OrderResponseDTO
 */
@Injectable()
export class OrderProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'Order',
        'OrderResponseDTO',
        forMember(
          (dest: OrderResponseDTO) => dest.id,
          mapFrom((src: Order) => src.id),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.userId,
          mapFrom((src: Order) => src.userId),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.amount,
          mapFrom((src: Order) => Number(src.amount)),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.currency,
          mapFrom((src: Order) => src.currency),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.paymentMethod,
          mapFrom((src: Order) => src.paymentMethod as PaymentMethod),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.paymentGateway,
          mapFrom(
            (src: Order) => (src.paymentGateway as PaymentGateway) || undefined,
          ),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.transactionId,
          mapFrom((src: Order) => src.transactionId || undefined),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.gatewayTransactionId,
          mapFrom((src: Order) => src.gatewayTransactionId || undefined),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.status,
          mapFrom((src: Order) => src.status as OrderStatus),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.orderType,
          mapFrom((src: Order) => src.orderType as OrderType),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.enrollmentId,
          mapFrom((src: Order) => src.enrollmentId || undefined),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.couponId,
          mapFrom((src: Order) => src.couponId || undefined),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.description,
          mapFrom((src: Order) => src.description || undefined),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.metadata,
          mapFrom((src: Order) => (src.metadata as Record<string, any>) || {}),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.completedAt,
          mapFrom((src: Order) => src.completedAt || undefined),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.failedAt,
          mapFrom((src: Order) => src.failedAt || undefined),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.createdAt,
          mapFrom((src: Order) => src.createdAt),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.updatedAt,
          mapFrom((src: Order) => src.updatedAt),
        ),
        // Joined user fields — populated when order is fetched with `include: { user: true }`
        forMember(
          (dest: OrderResponseDTO) => dest.userEmail,
          mapFrom((src: any) => src.user?.email || undefined),
        ),
        forMember(
          (dest: OrderResponseDTO) => dest.userName,
          mapFrom((src: any) => src.user?.displayName || undefined),
        ),
      );
    };
  }
}
