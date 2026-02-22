import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Review } from '@prisma/generated';
import type { ReviewResponseDTO } from '@workspace/schemas';

/**
 * Review AutoMapper Profile
 * Maps Review entity (Prisma) to ReviewResponseDTO
 */
@Injectable()
export class ReviewProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                'Review',
                'ReviewResponseDTO',
                forMember(
                    (dest: ReviewResponseDTO) => dest.id,
                    mapFrom((src: Review) => src.id),
                ),
                forMember(
                    (dest: ReviewResponseDTO) => dest.userId,
                    mapFrom((src: Review) => src.userId),
                ),
                forMember(
                    (dest: ReviewResponseDTO) => dest.courseId,
                    mapFrom((src: Review) => src.courseId),
                ),
                forMember(
                    (dest: ReviewResponseDTO) => dest.rating,
                    mapFrom((src: Review) => src.rating),
                ),
                forMember(
                    (dest: ReviewResponseDTO) => dest.comment,
                    mapFrom((src: Review) => (src as any).comment || undefined),
                ),
                forMember(
                    (dest: ReviewResponseDTO) => dest.createdAt,
                    mapFrom((src: Review) => src.createdAt),
                ),
                forMember(
                    (dest: ReviewResponseDTO) => dest.updatedAt,
                    mapFrom((src: Review) => src.updatedAt),
                ),
                // Note: user field is populated separately in service
                forMember(
                    (dest: ReviewResponseDTO) => dest.user,
                    mapFrom((src: any) =>
                        src.user
                            ? {
                                id: src.user.id,
                                displayName: src.user.displayName,
                                avatarUrl: src.user.avatarUrl || undefined,
                            }
                            : undefined,
                    ),
                ),
            );
        };
    }
}
