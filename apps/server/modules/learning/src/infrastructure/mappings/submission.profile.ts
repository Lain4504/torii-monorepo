import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Submission } from '@prisma/generated';
import type { SubmissionResponseDTO } from '@workspace/schemas';

/**
 * Submission AutoMapper Profile
 * Maps Submission entity (Prisma) to SubmissionResponseDTO
 */
@Injectable()
export class SubmissionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'Submission',
        'SubmissionResponseDTO',
        forMember(
          (dest: SubmissionResponseDTO) => dest.id,
          mapFrom((src: Submission) => src.id),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.assignmentId,
          mapFrom((src: Submission) => src.assignmentId),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.userId,
          mapFrom((src: Submission) => src.userId),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.textAnswer,
          mapFrom((src: Submission) => src.textAnswer || undefined),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.fileUrls,
          mapFrom((src: Submission) => src.fileUrls),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.status,
          mapFrom((src: Submission) => src.status as any),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.submittedAt,
          mapFrom((src: Submission) => src.submittedAt || undefined),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.isLate,
          mapFrom((src: Submission) => src.isLate),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.daysLate,
          mapFrom((src: Submission) => src.daysLate || undefined),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.score,
          mapFrom((src: Submission) => src.score ? Number(src.score) : undefined),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.feedback,
          mapFrom((src: Submission) => src.feedback || undefined),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.gradedBy,
          mapFrom((src: Submission) => src.gradedBy || undefined),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.gradedAt,
          mapFrom((src: Submission) => src.gradedAt || undefined),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.attemptNumber,
          mapFrom((src: Submission) => src.attemptNumber),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.previousSubmissionId,
          mapFrom((src: Submission) => src.previousSubmissionId || undefined),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.createdAt,
          mapFrom((src: Submission) => src.createdAt),
        ),
        forMember(
          (dest: SubmissionResponseDTO) => dest.updatedAt,
          mapFrom((src: Submission) => src.updatedAt),
        ),
      );
    };
  }
}
