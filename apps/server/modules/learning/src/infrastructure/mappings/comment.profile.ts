import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Comment } from '@prisma/generated';
import type { CommentResponseDTO } from '@workspace/schemas';

/**
 * Comment AutoMapper Profile
 * Maps Comment entity (Prisma) to CommentResponseDTO
 */
@Injectable()
export class CommentProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'Comment',
        'CommentResponseDTO',
        forMember(
          (dest: CommentResponseDTO) => dest.id,
          mapFrom((src: Comment) => src.id),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.postId,
          mapFrom((src: Comment) => src.postId),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.userId,
          mapFrom((src: Comment) => src.userId),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.authorId,
          mapFrom((src: Comment) => src.userId),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.content,
          mapFrom((src: Comment) => src.content),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.parentCommentId,
          mapFrom((src: Comment) => src.parentCommentId || undefined),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.parentId,
          mapFrom((src: Comment) => src.parentCommentId || undefined),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.likeCount,
          mapFrom((src: Comment) => src.likes),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.status,
          mapFrom((src: Comment) => src.status),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.isDeleted,
          mapFrom((src: Comment) => src.status === 'deleted'),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.isEdited,
          mapFrom((src: Comment) => {
            // Check if updatedAt is significantly different from createdAt
            if (!src.createdAt || !src.updatedAt) return false;
            return src.updatedAt.getTime() > src.createdAt.getTime() + 1000; // 1 second threshold
          }),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.createdAt,
          mapFrom((src: Comment) => src.createdAt),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.updatedAt,
          mapFrom((src: Comment) => src.updatedAt),
        ),
        // Note: author, replyCount, and replies fields are populated separately in service
        forMember(
          (dest: CommentResponseDTO) => dest.author,
          mapFrom(() => undefined),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.replyCount,
          mapFrom(() => undefined),
        ),
        forMember(
          (dest: CommentResponseDTO) => dest.replies,
          mapFrom(() => undefined),
        ),
      );
    };
  }
}
