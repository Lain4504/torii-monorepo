import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Lesson } from '@prisma/generated';
import type { LessonResponseDTO } from '@workspace/schemas';

/**
 * Lesson AutoMapper Profile
 * Maps Lesson entity (Prisma) to LessonResponseDTO
 */
@Injectable()
export class LessonProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap<Lesson, LessonResponseDTO>(
        mapper,
        'Lesson',
        'LessonResponseDTO',
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id),
        ),
        forMember(
          (dest) => dest.moduleId,
          mapFrom((src) => src.moduleId),
        ),
        forMember(
          (dest) => dest.title,
          mapFrom((src) => src.title),
        ),
        forMember(
          (dest) => dest.contentType,
          mapFrom((src) => src.contentType as any),
        ),
        forMember(
          (dest) => dest.videoUrl,
          mapFrom((src) => src.videoUrl || undefined),
        ),
        forMember(
          (dest) => dest.videoDuration,
          mapFrom((src) => src.videoDuration || undefined),
        ),
        forMember(
          (dest) => dest.articleContent,
          mapFrom((src) => src.articleContent || undefined),
        ),
        forMember(
          (dest) => dest.isPreview,
          mapFrom((src) => src.isPreview),
        ),
        forMember(
          (dest) => dest.isUnlocked,
          mapFrom((src) => src.isUnlocked),
        ),
        forMember(
          (dest) => dest.status,
          mapFrom((src) => (src as any).status || 'published'),
        ),
        forMember(
          (dest) => dest.createdBy,
          mapFrom((src) => src.createdBy || undefined),
        ),
        forMember(
          (dest) => dest.createdAt,
          mapFrom((src) => src.createdAt),
        ),
        forMember(
          (dest) => dest.updatedAt,
          mapFrom((src) => src.updatedAt),
        ),
        forMember(
          (dest) => dest.deletedAt,
          mapFrom((src) => src.deletedAt || undefined),
        ),
      );
    };
  }
}
