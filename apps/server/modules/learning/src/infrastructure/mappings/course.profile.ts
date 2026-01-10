import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Course } from '@prisma/generated';
import type { CourseResponseDTO } from '@workspace/schemas';
import { CourseStatus } from '@workspace/schemas';

/**
 * Course AutoMapper Profile
 * Maps Course entity (Prisma) to CourseResponseDTO
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
        'Course',
        'CourseResponseDTO',
        // Map all fields explicitly to ensure compatibility with Prisma plain objects
        forMember(
          (dest: CourseResponseDTO) => dest.id,
          mapFrom((src: Course) => src.id),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.title,
          mapFrom((src: Course) => src.title),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.slug,
          mapFrom((src: Course) => src.slug),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.type,
          mapFrom((src: Course) => src.type as 'vod' | 'live'),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.description,
          mapFrom((src: Course) => src.description || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.shortDescription,
          mapFrom((src: Course) => src.shortDescription || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.jlptLevel,
          mapFrom((src: Course) => src.jlptLevel as any),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.aiMetadata,
          mapFrom((src: Course) => (src.aiMetadata as any) || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.thumbnailUrl,
          mapFrom((src: Course) => src.thumbnailUrl || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.previewVideoUrl,
          mapFrom((src: Course) => src.previewVideoUrl || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.price,
          mapFrom((src: Course) => Number(src.price)),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.discountPrice,
          mapFrom((src: Course) => (src.discountPrice ? Number(src.discountPrice) : undefined)),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.liveConfig,
          mapFrom((src: Course) => (src.liveConfig as any) || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.durationWeeks,
          mapFrom((src: Course) => src.durationWeeks || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.totalLessons,
          mapFrom((src: Course) => src.totalLessons),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.totalQuizzes,
          mapFrom((src: Course) => src.totalQuizzes),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.totalStudents,
          mapFrom((src: Course) => src.totalStudents),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.averageRating,
          mapFrom((src: Course) => Number(src.averageRating)),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.totalReviews,
          mapFrom((src: Course) => src.totalReviews),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.status,
          mapFrom((src: Course) => (src as any).status as CourseStatus),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.isFree,
          mapFrom((src: Course) => src.isFree),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.tags,
          mapFrom((src: Course) => src.tags),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.learningOutcomes,
          mapFrom((src: Course) => src.learningOutcomes || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.requirements,
          mapFrom((src: Course) => src.requirements || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.createdBy,
          mapFrom((src: Course) => src.createdBy || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.approvedBy,
          mapFrom((src: Course) => src.approvedBy || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.approvedAt,
          mapFrom((src: Course) => src.approvedAt || undefined),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.createdAt,
          mapFrom((src: Course) => src.createdAt),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.updatedAt,
          mapFrom((src: Course) => src.updatedAt),
        ),
        forMember(
          (dest: CourseResponseDTO) => dest.deletedAt,
          mapFrom((src: Course) => src.deletedAt || undefined),
        ),
      );
    };
  }
}

