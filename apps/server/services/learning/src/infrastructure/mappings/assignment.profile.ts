import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
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
    return (mapper: Mapper) => {
      createMap<Assignment, AssignmentResponseDTO>(
        mapper,
        'Assignment',
        'AssignmentResponseDTO',
        forMember(
          (dest) => dest.id,
          mapFrom((src) => src.id)
        ),
        forMember(
          (dest) => dest.title,
          mapFrom((src) => src.title)
        ),
        forMember(
          (dest) => dest.description,
          mapFrom((src) => src.description)
        ),
        forMember(
          (dest) => dest.type,
          mapFrom((src) => src.type as any)
        ),
        forMember(
          (dest) => dest.courseRunId,
          mapFrom((src) => src.courseRunId || undefined)
        ),
        forMember(
          (dest) => dest.moduleId,
          mapFrom((src) => src.moduleId || undefined)
        ),
        forMember(
          (dest) => dest.lessonId,
          mapFrom((src) => src.lessonId || undefined)
        ),
        forMember(
          (dest) => dest.maxScore,
          mapFrom((src) => Number(src.maxScore))
        ),
        forMember(
          (dest) => dest.passingScore,
          mapFrom((src) => src.passingScore ? Number(src.passingScore) : undefined)
        ),
        forMember(
          (dest) => dest.dueDate,
          mapFrom((src) => src.dueDate || undefined)
        ),
        forMember(
          (dest) => dest.allowLateSubmission,
          mapFrom((src) => src.allowLateSubmission)
        ),
        forMember(
          (dest) => dest.latePenaltyPercent,
          mapFrom((src) => src.latePenaltyPercent ? Number(src.latePenaltyPercent) : undefined)
        ),
        forMember(
          (dest) => dest.allowedFileTypes,
          mapFrom((src) => src.allowedFileTypes as string[])
        ),
        forMember(
          (dest) => dest.maxFileSize,
          mapFrom((src) => src.maxFileSize ? Number(src.maxFileSize) : undefined)
        ),
        forMember(
          (dest) => dest.maxFiles,
          mapFrom((src) => src.maxFiles || undefined)
        ),
        forMember(
          (dest) => dest.instructions,
          mapFrom((src) => src.instructions || undefined)
        ),
        forMember(
          (dest) => dest.attachmentUrls,
          mapFrom((src) => src.attachmentUrls as string[])
        ),
        forMember(
          (dest) => dest.createdBy,
          mapFrom((src) => src.createdBy)
        ),
        forMember(
          (dest) => dest.status,
          mapFrom((src) => src.status as any)
        ),
        forMember(
          (dest) => dest.publishedAt,
          mapFrom((src) => src.publishedAt || undefined)
        ),
        forMember(
          (dest) => dest.createdAt,
          mapFrom((src) => src.createdAt)
        ),
        forMember(
          (dest) => dest.updatedAt,
          mapFrom((src) => src.updatedAt)
        )
      );
    };
  }
}
