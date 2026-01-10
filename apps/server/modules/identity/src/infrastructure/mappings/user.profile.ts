import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { User } from '@prisma/generated';
import type { UserResponseDTO } from '@workspace/schemas';
import { UserRole } from '@workspace/schemas';

/**
 * User AutoMapper Profile
 * Maps User entity (Prisma) to UserResponseDTO
 * Excludes password and salt fields for security
 */
@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'User',
        'UserResponseDTO',
        // Map all fields explicitly to ensure compatibility with Prisma plain objects
        forMember(
          (dest: UserResponseDTO) => dest.id,
          mapFrom((src: User) => src.id),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.email,
          mapFrom((src: User) => src.email),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.displayName,
          mapFrom((src: User) => src.displayName),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.role,
          mapFrom((src: User) => src.role as UserRole),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.verifiedAt,
          mapFrom((src: User) => src.verifiedAt || undefined),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.bannedUntil,
          mapFrom((src: User) => src.bannedUntil || undefined),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.lastLoginAt,
          mapFrom((src: User) => src.lastSignInAt || undefined),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.createdAt,
          mapFrom((src: User) => src.createdAt),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.updatedAt,
          mapFrom((src: User) => src.updatedAt),
        ),
        forMember(
          (dest: UserResponseDTO) => dest.deletedAt,
          mapFrom((src: User) => src.deletedAt || undefined),
        ),
      );
    };
  }
}

