import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { FlashcardDeck } from '@prisma/generated';
import type { FlashcardDeckResponseDTO } from '@workspace/schemas';

/**
 * FlashcardDeck AutoMapper Profile
 * Maps FlashcardDeck entity (Prisma) to FlashcardDeckResponseDTO
 */
@Injectable()
export class FlashcardDeckProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap<FlashcardDeck, FlashcardDeckResponseDTO>(
        mapper,
        'FlashcardDeck',
        'FlashcardDeckResponseDTO',
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.userId,
          mapFrom((src) => src.userId),
        ),
        forMember(
          (dest) => dest.name,
          mapFrom((src) => src.name),
        ),
        forMember(
          (dest) => dest.description,
          mapFrom((src) => src.description || undefined),
        ),
        forMember(
          (dest) => dest.jlptLevel,
          mapFrom((src) => src.jlptLevel || undefined),
        ),
        forMember(
          (dest) => dest.isPublic,
          mapFrom((src) => src.isPublic),
        ),
        forMember(
          (dest) => dest.tags,
          mapFrom((src) => src.tags || []),
        ),
        forMember(
          (dest) => dest.cardCount,
          mapFrom((src) => src.cardCount),
        ),
        forMember(
          (dest) => dest.studiedCount,
          mapFrom((src) => src.studiedCount),
        ),
        forMember(
          (dest) => dest.srsSettings,
          mapFrom((src) => (src.srsSettings as any) || undefined),
        ),
        forMember(
          (dest) => dest.aiSettings,
          mapFrom((src) => (src.aiSettings as any) || undefined),
        ),
        forMember(
          (dest) => dest.sourceType,
          mapFrom((src) => src.sourceType || 'manual'),
        ),
        forMember(
          (dest) => dest.lastStudiedAt,
          mapFrom((src) => src.lastStudiedAt || undefined),
        ),
        forMember(
          (dest) => dest.totalStudyTime,
          mapFrom((src) => src.totalStudyTime || 0),
        ),
        forMember(
          (dest) => dest.masteryPercentage,
          mapFrom((src) =>
            src.masteryPercentage ? Number(src.masteryPercentage) : undefined,
          ),
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
