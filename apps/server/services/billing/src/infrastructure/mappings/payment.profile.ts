import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Payment } from '@prisma/generated';
import type { PaymentResponseDTO } from '@workspace/schemas';

/**
 * Payment AutoMapper Profile
 * Maps Payment entity (Prisma) to PaymentResponseDTO
 */
@Injectable()
export class PaymentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'Payment',
        'PaymentResponseDTO',
        forMember(
          (dest: PaymentResponseDTO) => dest.id,
          mapFrom((src: Payment) => src.id),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.orderId,
          mapFrom((src: Payment) => src.orderId || undefined),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.transactionId,
          mapFrom((src: Payment) => src.transactionId || undefined),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.gateway,
          mapFrom((src: Payment) => src.gateway || undefined),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.amount,
          mapFrom((src: Payment) =>
            src.amount ? Number(src.amount) : undefined,
          ),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.currency,
          mapFrom((src: Payment) => src.currency),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.content,
          mapFrom((src: Payment) => src.content || undefined),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.status,
          mapFrom((src: Payment) => src.status || undefined),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.rawResponse,
          mapFrom((src: Payment) => src.rawResponse || {}),
        ),
        forMember(
          (dest: PaymentResponseDTO) => dest.processedAt,
          mapFrom((src: Payment) => src.processedAt),
        ),
      );
    };
  }
}
