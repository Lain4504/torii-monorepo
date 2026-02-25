import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { DiscussionTopic } from '@prisma/generated';
import type { FeedResponseDTO } from '@workspace/schemas';

/**
 * Discussion AutoMapper Profile
 * Maps DiscussionTopic entity (Prisma) to FeedResponseDTO (Temporarily reused)
 */
@Injectable()
export class DiscussionProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                'DiscussionTopic',
                'FeedResponseDTO',
                forMember(
                    (dest: FeedResponseDTO) => dest.id,
                    mapFrom((src: DiscussionTopic) => src.id),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.title,
                    mapFrom((src: DiscussionTopic) => src.title),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.content,
                    mapFrom((src: DiscussionTopic) => src.content),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.authorId,
                    mapFrom((src: DiscussionTopic) => src.authorId),
                ),
                // Tags removed from DiscussionTopic in schema? Let's check schema.
                // Schema: DiscussionTopic { id, title, content, authorId, courseId, moduleId, lessonId, isPinned, isLocked, viewCount, commentCount, ... }
                // No tags array in new schema. 
                forMember(
                    (dest: FeedResponseDTO) => dest.tags,
                    mapFrom(() => []),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.viewCount,
                    mapFrom((src: DiscussionTopic) => src.viewCount),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.likes,
                    mapFrom(() => 0), // Removed likeCount
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.comments,
                    mapFrom((src: DiscussionTopic) => src.commentCount),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.createdAt,
                    mapFrom((src: DiscussionTopic) => src.createdAt),
                ),
                forMember(
                    (dest: FeedResponseDTO) => dest.updatedAt,
                    mapFrom((src: DiscussionTopic) => src.updatedAt),
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
                forMember(
                    (dest: FeedResponseDTO) => dest.isLiked,
                    mapFrom(() => false),
                ),
            );
        };
    }
}
