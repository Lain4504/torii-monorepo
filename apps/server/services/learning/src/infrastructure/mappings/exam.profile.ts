import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type {
  ExamResponseDTO,
  ExamSessionResponseDTO,
} from '@workspace/schemas';
import { ExamSessionStatus } from '@workspace/schemas';

/**
 * Exam AutoMapper Profile
 * Maps Quiz/QuizAttempt entities (Prisma) to ExamResponseDTO / ExamSessionResponseDTO
 * Note: Prisma model is named Quiz but DTO uses Exam for API compatibility
 */
@Injectable()
export class ExamProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // Quiz → ExamResponseDTO
      createMap(
        mapper,
        'Quiz',
        'ExamResponseDTO',
        forMember(
          (dest: ExamResponseDTO) => dest.id,
          mapFrom((src: any) => src.id),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.title,
          mapFrom((src: any) => src.title),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.description,
          mapFrom((src: any) => src.description || undefined),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.jlptLevel,
          mapFrom((src: any) => src.jlptLevel),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.examType,
          mapFrom((src: any) => src.quizType), // Map quizType → examType
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.sections,
          mapFrom((src: any) => src.sections),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.totalTime,
          mapFrom((src: any) => src.totalTime || 0),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.totalQuestions,
          mapFrom((src: any) => src.totalQuestions),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.status,
          mapFrom((src: any) => src.status),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.createdBy,
          mapFrom((src: any) => src.createdBy || undefined),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.createdAt,
          mapFrom((src: any) => src.createdAt),
        ),
        forMember(
          (dest: ExamResponseDTO) => dest.updatedAt,
          mapFrom((src: any) => src.updatedAt),
        ),
      );

      // QuizAttempt → ExamSessionResponseDTO
      createMap(
        mapper,
        'QuizAttempt',
        'ExamSessionResponseDTO',
        forMember(
          (dest: ExamSessionResponseDTO) => dest.id,
          mapFrom((src: any) => src.id),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.examId,
          mapFrom((src: any) => src.quizId), // Map quizId → examId
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.userId,
          mapFrom((src: any) => src.userId),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.status,
          mapFrom((src: any) => src.status as ExamSessionStatus),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.startedAt,
          mapFrom((src: any) => src.startedAt),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.submittedAt,
          mapFrom((src: any) => src.submittedAt ?? undefined),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.timeRemaining,
          mapFrom((src: any) => src.timeRemaining ?? undefined),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.answers,
          mapFrom((src: any) => src.answers as Record<string, string>),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.flaggedQuestions,
          mapFrom((src: any) => src.flaggedQuestions ?? []),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.currentSection,
          mapFrom((src: any) => src.currentSection ?? undefined),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.currentQuestion,
          mapFrom((src: any) => src.currentQuestion ?? undefined),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.createdAt,
          mapFrom((src: any) => src.createdAt),
        ),
        forMember(
          (dest: ExamSessionResponseDTO) => dest.updatedAt,
          mapFrom((src: any) => src.updatedAt),
        ),
      );
    };
  }
}
