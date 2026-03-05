import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { LessonMaterial } from '@prisma/generated';
import type { LessonMaterialResponseDTO } from '@workspace/schemas';

/**
 * LessonMaterial AutoMapper Profile
 * Maps LessonMaterial entity (Prisma) to LessonMaterialResponseDTO
 */
@Injectable()
export class LessonMaterialProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'LessonMaterial',
        'LessonMaterialResponseDTO',
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.id,
          mapFrom((src: LessonMaterial) => src.id),
        ),
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.lessonId,
          mapFrom((src: LessonMaterial) => src.lessonId),
        ),
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.fileAssetId,
          mapFrom((src: LessonMaterial) => src.fileAssetId),
        ),
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.type,
          mapFrom((src: LessonMaterial) => src.type as any),
        ),
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.title,
          mapFrom((src: LessonMaterial) => src.title || null),
        ),
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.orderIndex,
          mapFrom((src: LessonMaterial) => src.orderIndex),
        ),
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.createdBy,
          mapFrom((src: LessonMaterial) => src.createdBy),
        ),
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.createdAt,
          mapFrom((src: LessonMaterial) => src.createdAt),
        ),
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.updatedAt,
          mapFrom((src: LessonMaterial) => src.updatedAt),
        ),
        // Note: fileAsset is populated from included relation
        forMember(
          (dest: LessonMaterialResponseDTO) => dest.fileAsset,
          mapFrom((src: any) =>
            src.fileAsset
              ? {
                  id: src.fileAsset.id,
                  fileUrl: src.fileAsset.fileUrl,
                  mimeType: src.fileAsset.mimeType,
                  fileSize: src.fileAsset.fileSize,
                  status: src.fileAsset.status,
                }
              : undefined,
          ),
        ),
      );
    };
  }
}
