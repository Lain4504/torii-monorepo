import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Module } from '@prisma/generated';
import type { ModuleResponseDTO } from '@workspace/schemas';

/**
 * Module AutoMapper Profile
 * Maps Module entity (Prisma) to ModuleResponseDTO
 */
@Injectable()
export class ModuleProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper: Mapper) => {
            createMap<Module, ModuleResponseDTO>(
                mapper,
                'Module',
                'ModuleResponseDTO',
                forMember(
                    (dest) => dest.id,
                    mapFrom((src) => src.id),
                ),
                forMember(
                    (dest) => dest.courseMasterId,
                    mapFrom((src) => src.courseMasterId),
                ),
                forMember(
                    (dest) => dest.title,
                    mapFrom((src) => src.title),
                ),
                forMember(
                    (dest) => dest.description,
                    mapFrom((src) => src.description || undefined),
                ),
                forMember(
                    (dest) => dest.aiMetadata,
                    mapFrom((src) => (src.aiMetadata as any) || undefined),
                ),
                forMember(
                    (dest) => dest.orderIndex,
                    mapFrom((src) => src.orderIndex),
                ),
                forMember(
                    (dest) => dest.status,
                    mapFrom((src) => (src as any).status || 'published'),
                ),
                forMember(
                    (dest) => dest.durationMinutes,
                    mapFrom((src) => src.durationMinutes || undefined),
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
                forMember(
                    (dest) => dest.deletedAt,
                    mapFrom((src) => src.deletedAt || undefined),
                ),
            );
        };
    }
}
