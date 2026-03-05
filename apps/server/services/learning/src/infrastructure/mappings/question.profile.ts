import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Question } from '@prisma/generated';
import type { QuestionResponseDTO } from '@workspace/schemas';

/**
 * Question AutoMapper Profile
 * Maps Question entity (Prisma) to QuestionResponseDTO
 */
@Injectable()
export class QuestionProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper: Mapper) => {
            createMap<Question, QuestionResponseDTO>(
                mapper,
                'Question',
                'QuestionResponseDTO',
                forMember(
                    (dest) => dest.id,
                    mapFrom((src) => src.id),
                ),
                forMember(
                    (dest) => dest.poolId,
                    mapFrom((src) => src.poolId || undefined),
                ),
                forMember(
                    (dest) => dest.questionText,
                    mapFrom((src) => src.questionText),
                ),
                forMember(
                    (dest) => dest.questionType,
                    mapFrom((src) => src.questionType as any),
                ),
                forMember(
                    (dest) => dest.jlptLevel,
                    mapFrom((src) => src.jlptLevel as any),
                ),
                forMember(
                    (dest) => dest.category,
                    mapFrom((src) => src.category as any),
                ),
                forMember(
                    (dest) => dest.subcategory,
                    mapFrom((src) => src.subcategory || undefined),
                ),
                forMember(
                    (dest) => dest.difficulty,
                    mapFrom((src) => src.difficulty as any),
                ),
                forMember(
                    (dest) => dest.options,
                    mapFrom((src) => src.options as any),
                ),
                forMember(
                    (dest) => dest.correctAnswer,
                    mapFrom((src) => src.correctAnswer || undefined),
                ),
                forMember(
                    (dest) => dest.explanation,
                    mapFrom((src) => src.explanation || undefined),
                ),
                forMember(
                    (dest) => dest.metadata,
                    mapFrom((src) => src.metadata as any),
                ),
                forMember(
                    (dest) => dest.createdBy,
                    mapFrom((src) => src.createdBy || undefined),
                ),
                forMember(
                    (dest) => dest.status,
                    mapFrom((src) => src.status as any),
                ),
                forMember(
                    (dest) => dest.usageCount,
                    mapFrom((src) => src.usageCount),
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
