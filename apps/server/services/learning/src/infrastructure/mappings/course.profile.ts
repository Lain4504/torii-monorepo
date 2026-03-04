import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { CourseMaster } from '@prisma/generated';
import type { CourseMasterResponseDTO } from '@workspace/schemas';
import { CourseMasterStatus } from '@workspace/schemas';

/**
 * CourseMaster AutoMapper Profile
 * Maps CourseMaster entity (Prisma) to CourseMasterResponseDTO
 */
@Injectable()
export class CourseProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'CourseMaster',
        'CourseMasterResponseDTO',
        // Map all fields explicitly to ensure compatibility with Prisma plain objects
        forMember(
          (dest: CourseMasterResponseDTO) => dest.id,
          mapFrom((src: CourseMaster) => src.id),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.title,
          mapFrom((src: CourseMaster) => src.title),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.slug,
          mapFrom((src: CourseMaster) => src.slug),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.type,
          mapFrom((src: CourseMaster) => src.type as 'vod' | 'live'),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.description,
          mapFrom((src: CourseMaster) => src.description || undefined),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.shortDescription,
          mapFrom((src: CourseMaster) => src.shortDescription || undefined),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.jlptLevel,
          mapFrom((src: CourseMaster) => src.jlptLevel as any),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.aiMetadata,
          mapFrom((src: CourseMaster) => (src.aiMetadata as any) || undefined),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.totalLessons,
          mapFrom((src: CourseMaster) => src.totalLessons),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.totalQuizzes,
          mapFrom((src: CourseMaster) => src.totalQuizzes),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.status,
          mapFrom((src: CourseMaster) => (src as any).status as CourseMasterStatus),
        ),

        forMember(
          (dest: CourseMasterResponseDTO) => dest.tags,
          mapFrom((src: CourseMaster) => src.tags),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.learningOutcomes,
          mapFrom((src: CourseMaster) => src.learningOutcomes || undefined),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.requirements,
          mapFrom((src: CourseMaster) => src.requirements || undefined),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.createdBy,
          mapFrom((src: CourseMaster) => src.createdBy || undefined),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.approvedBy,
          mapFrom((src: CourseMaster) => src.approvedBy || undefined),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.approvedAt,
          mapFrom((src: CourseMaster) => src.approvedAt || undefined),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.createdAt,
          mapFrom((src: CourseMaster) => src.createdAt),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.updatedAt,
          mapFrom((src: CourseMaster) => src.updatedAt),
        ),
        forMember(
          (dest: CourseMasterResponseDTO) => dest.deletedAt,
          mapFrom((src: CourseMaster) => src.deletedAt || undefined),
        ),
      );
    };
  }
}

