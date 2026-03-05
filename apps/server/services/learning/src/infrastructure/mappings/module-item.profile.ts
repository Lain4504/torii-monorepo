import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { ModuleItem } from '@prisma/generated';
import type { ModuleItem as ModuleItemDTO } from '@workspace/schemas';

/**
 * Module Item AutoMapper Profile
 * Maps ModuleItem entity (Prisma) to ModuleItem DTO
 */
@Injectable()
export class ModuleItemProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper: Mapper) => {
            createMap<ModuleItem, ModuleItemDTO>(
                mapper,
                'ModuleItem',
                'ModuleItem',
                forMember(
                    (dest) => dest.id,
                    mapFrom((src) => src.id),
                ),
                forMember(
                    (dest) => dest.moduleId,
                    mapFrom((src) => src.moduleId),
                ),
                forMember(
                    (dest) => dest.title,
                    mapFrom((src) => src.title),
                ),
                forMember(
                    (dest) => dest.type,
                    mapFrom((src) => src.type as any),
                ),
                forMember(
                    (dest) => dest.referenceId,
                    mapFrom((src) => src.referenceId),
                ),
                forMember(
                    (dest) => dest.orderIndex,
                    mapFrom((src) => src.orderIndex),
                ),
            );
        };
    }
}
