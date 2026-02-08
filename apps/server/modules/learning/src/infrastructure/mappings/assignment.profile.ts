import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import type { Assignment, Prisma } from '@prisma/generated';
import type { AssignmentResponseDTO } from '@workspace/schemas';

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
          mapFrom((src) => src.type)
        ),
        forMember(
          (dest) => dest.courseId,
          mapFrom((src) => src.courseId)
        ),
        forMember(
          (dest) => dest.moduleId,
          mapFrom((src) => src.moduleId)
        ),
        forMember(
          (dest) => dest.lessonId,
          mapFrom((src) => src.lessonId)
        ),
        forMember(
          (dest) => dest.maxScore as any,
          mapFrom((src) => src.maxScore)
        ),
        forMember(
          (dest) => dest.passingScore as any,
          mapFrom((src) => src.passingScore)
        ),
        forMember(
          (dest) => dest.dueDate as any,
          mapFrom((src) => src.dueDate?.toISOString())
        ),
        forMember(
          (dest) => dest.allowLateSubmission,
          mapFrom((src) => src.allowLateSubmission)
        ),
        forMember(
          (dest) => dest.latePenaltyPercent as any,
          mapFrom((src) => src.latePenaltyPercent ? Number(src.latePenaltyPercent) : undefined)
        ),
        forMember(
          (dest) => dest.allowedFileTypes,
          mapFrom((src) => src.allowedFileTypes as string[])
        ),
        forMember(
          (dest) => dest.maxFileSize,
          mapFrom((src) => src.maxFileSize)
        ),
        forMember(
          (dest) => dest.maxFiles,
          mapFrom((src) => src.maxFiles)
        ),
        forMember(
          (dest) => dest.instructions,
          mapFrom((src) => src.instructions)
        ),
        forMember(
          (dest) => dest.attachmentUrls,
          mapFrom((src) => src.attachmentUrls as string[])
        ),
        forMember(
          (dest) => dest.status,
          mapFrom((src) => src.status)
        ),
        forMember(
          (dest) => dest.publishedAt as any,
          mapFrom((src) => src.publishedAt?.toISOString())
        ),
        forMember(
          (dest) => dest.createdAt as any,
          mapFrom((src) => src.createdAt.toISOString())
        ),
        forMember(
          (dest) => dest.updatedAt as any,
          mapFrom((src) => src.updatedAt.toISOString())
        )
      );
    };
  }
}
