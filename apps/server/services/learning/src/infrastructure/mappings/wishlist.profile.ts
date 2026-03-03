import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Wishlist } from '@prisma/generated';
import type { WishlistResponseDTO } from '@workspace/schemas';

/**
 * Wishlist AutoMapper Profile
 * Maps Wishlist entity (Prisma) to WishlistResponseDTO
 */
@Injectable()
export class WishlistProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper: Mapper) => {
            createMap<Wishlist, WishlistResponseDTO>(
                mapper,
                'Wishlist',
                'WishlistResponseDTO',
                forMember(
                    (dest) => dest.id,
                    mapFrom((src) => src.id),
                ),
                forMember(
                    (dest) => dest.userId,
                    mapFrom((src) => src.userId),
                ),
                forMember(
                    (dest) => dest.courseRunId,
                    mapFrom((src) => src.courseRunId),
                ),
                forMember(
                    (dest) => dest.addedAt,
                    mapFrom((src) => src.addedAt),
                ),
            );
        };
    }
}
