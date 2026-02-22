import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Feed } from '@prisma/generated';
import type { FeedResponseDTO } from '@workspace/schemas';

/**
 * Feed AutoMapper Profile
 * Maps Feed entity (Prisma) to FeedResponseDTO
 */
@Injectable()
export class FeedProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                'Feed',
                'FeedResponseDTO',
                forMember(
                    (dest: FeedResponseDTO) => dest.id,
                    mapFrom((src: Feed) => src.id),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.title,
                    mapFrom((src: Feed) => src.title),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.content,
                    mapFrom((src: Feed) => src.content),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.authorId,
                    mapFrom((src: Feed) => src.authorId),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.tags,
                    mapFrom((src: Feed) => src.tags),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.viewCount,
                    mapFrom((src: Feed) => src.viewCount),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.likes,
                    mapFrom((src: any) => src._count?.likes ?? src.likeCount ?? 0),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.comments,
                    mapFrom((src: any) => src._count?.comments ?? src.commentCount ?? 0),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.createdAt,
                    mapFrom((src: Feed) => src.createdAt),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.updatedAt,
                    mapFrom((src: Feed) => src.updatedAt),
                ),
                // author is populated from included relation
                forMember(
                    (dest: FeedResponseDTO) => dest.author,
                    mapFrom((src: any) =>
                        src.author
                            ? {
                                id: src.author.id,
                                displayName: src.author.displayName,
                                avatarUrl: src.author.avatarUrl,
                            }
                            : undefined,
                    ),
                ),
                // isLiked must be set separately after checking DB (per-user)
                forMember(
                    (dest: FeedResponseDTO) => dest.isLiked,
                    mapFrom(() => false),
                ),
            );
        };
    }
}
