import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Post } from '@prisma/generated';
import type { PostResponseDTO } from '@workspace/schemas';

/**
 * Post AutoMapper Profile
 * Maps Post entity (Prisma) to PostResponseDTO
 */
@Injectable()
export class PostProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'Post',
        'PostResponseDTO',
        forMember(
          (dest: PostResponseDTO) => dest.id,
          mapFrom((src: Post) => src.id),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.title,
          mapFrom((src: Post) => src.title),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.slug,
          mapFrom((src: Post) => src.slug),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.excerpt,
          mapFrom((src: Post) => src.excerpt || undefined),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.content,
          mapFrom((src: Post) => src.content),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.coverImageUrl,
          mapFrom((src: Post) => src.coverImageUrl || undefined),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.authorId,
          mapFrom((src: Post) => src.authorId),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.status,
          mapFrom((src: Post) => src.status as any),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.publishedAt,
          mapFrom((src: Post) => src.publishedAt || undefined),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.viewCount,
          mapFrom((src: Post) => src.viewCount),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.commentCount,
          mapFrom((src: Post) => src.commentCount),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.tags,
          mapFrom((src: Post) => src.tags || []),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.seoTitle,
          mapFrom((src: Post) => src.seoTitle || undefined),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.seoDescription,
          mapFrom((src: Post) => src.seoDescription || undefined),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.createdAt,
          mapFrom((src: Post) => src.createdAt),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.updatedAt,
          mapFrom((src: Post) => src.updatedAt),
        ),
        forMember(
          (dest: PostResponseDTO) => dest.author,
          mapFrom((src: any) => src.author ? {
            id: src.author.id,
            displayName: src.author.displayName,
            avatarUrl: src.author.avatarUrl
          } : undefined),
        ),
      );
    };
  }
}
