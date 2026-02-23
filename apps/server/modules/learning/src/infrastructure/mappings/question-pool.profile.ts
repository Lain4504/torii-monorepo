import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { QuestionPool } from '@prisma/generated';
import type { QuestionPoolResponseDTO } from '@workspace/schemas';

/**
 * QuestionPool AutoMapper Profile
 * Maps QuestionPool entity (Prisma) to QuestionPoolResponseDTO
 */
@Injectable()
export class QuestionPoolProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper: Mapper) => {
            createMap<QuestionPool, QuestionPoolResponseDTO>(
                mapper,
                'QuestionPool',
                'QuestionPoolResponseDTO',
                forMember(
                    (dest) => dest.id,
                    mapFrom((src) => src.id),
                ),
                forMember(
                    (dest) => dest.name,
                    mapFrom((src) => src.name),
                ),
                forMember(
                    (dest) => dest.description,
                    mapFrom((src) => src.description || undefined),
                ),
                forMember(
                    (dest) => dest.courseId,
                    mapFrom((src) => src.courseId || undefined),
                ),
                forMember(
                    (dest) => dest.lessonId,
                    mapFrom((src) => src.lessonId || undefined),
                ),
                forMember(
                    (dest) => dest.jlptLevel,
                    mapFrom((src) => src.jlptLevel as any),
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
            );
        };
    }
}
