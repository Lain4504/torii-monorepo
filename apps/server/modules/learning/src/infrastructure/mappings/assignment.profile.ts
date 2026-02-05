import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Assignment } from '@prisma/generated';
import type { AssignmentResponseDTO } from '@workspace/schemas';

/**
 * Assignment AutoMapper Profile
 * Maps Assignment entity (Prisma) to AssignmentResponseDTO
 */
@Injectable()
export class AssignmentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'Assignment',
        'AssignmentResponseDTO',
        forMember(
          (dest: AssignmentResponseDTO) => dest.id,
          mapFrom((src: Assignment) => src.id),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.title,
          mapFrom((src: Assignment) => src.title),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.description,
          mapFrom((src: Assignment) => src.description),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.type,
          mapFrom((src: Assignment) => src.type as any),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.courseId,
          mapFrom((src: Assignment) => src.courseId || undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.moduleId,
          mapFrom((src: Assignment) => src.moduleId || undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.lessonId,
          mapFrom((src: Assignment) => src.lessonId || undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.maxScore,
          mapFrom((src: Assignment) => Number(src.maxScore)),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.passingScore,
          mapFrom((src: Assignment) => src.passingScore ? Number(src.passingScore) : undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.dueDate,
          mapFrom((src: Assignment) => src.dueDate || undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.allowLateSubmission,
          mapFrom((src: Assignment) => src.allowLateSubmission),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.latePenaltyPercent,
          mapFrom((src: Assignment) => src.latePenaltyPercent ? Number(src.latePenaltyPercent) : undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.allowedFileTypes,
          mapFrom((src: Assignment) => src.allowedFileTypes),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.maxFileSize,
          mapFrom((src: Assignment) => src.maxFileSize ? Number(src.maxFileSize) : undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.maxFiles,
          mapFrom((src: Assignment) => src.maxFiles || undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.instructions,
          mapFrom((src: Assignment) => src.instructions || undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.attachmentUrls,
          mapFrom((src: Assignment) => src.attachmentUrls),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.createdBy,
          mapFrom((src: Assignment) => src.createdBy),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.status,
          mapFrom((src: Assignment) => src.status as any),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.publishedAt,
          mapFrom((src: Assignment) => src.publishedAt || undefined),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.createdAt,
          mapFrom((src: Assignment) => src.createdAt),
        ),
        forMember(
          (dest: AssignmentResponseDTO) => dest.updatedAt,
          mapFrom((src: Assignment) => src.updatedAt),
        ),
      );
    };
  }
}
