import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { DiscussionTopic } from '@prisma/generated';
import type { DiscussionTopicResponseDTO } from '@workspace/schemas';

/**
 * Discussion AutoMapper Profile
 * Maps DiscussionTopic entity (Prisma) to DiscussionTopicResponseDTO
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
        'DiscussionTopicResponseDTO',
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.id,
          mapFrom((src: DiscussionTopic) => src.id),
        ),
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.title,
          mapFrom((src: DiscussionTopic) => src.title),
        ),
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.content,
          mapFrom((src: DiscussionTopic) => src.content),
        ),
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.authorId,
          mapFrom((src: DiscussionTopic) => src.authorId),
        ),
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.viewCount,
          mapFrom((src: DiscussionTopic) => src.viewCount),
        ),
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.commentCount,
          mapFrom((src: DiscussionTopic) => src.commentCount),
        ),
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.createdAt,
          mapFrom((src: DiscussionTopic) => src.createdAt),
        ),
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.updatedAt,
          mapFrom((src: DiscussionTopic) => src.updatedAt),
        ),
        // author is populated from included relation
        forMember(
          (dest: DiscussionTopicResponseDTO) => dest.author,
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
      );
    };
  }
}
