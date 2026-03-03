import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { LiveSession } from '@prisma/generated';
import type { LiveSessionResponseDTO } from '@workspace/schemas';

/**
 * LiveSession AutoMapper Profile
 * Maps LiveSession entity (Prisma) to LiveSessionResponseDTO
 */
@Injectable()
export class LiveSessionProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                'LiveSession',
                'LiveSessionResponseDTO',
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.id,
                    mapFrom((src: LiveSession) => src.id),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.courseRunId,
                    mapFrom((src: LiveSession) => src.courseRunId),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.lecturerId,
                    mapFrom((src: LiveSession) => src.lecturerId),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.title,
                    mapFrom((src: LiveSession) => src.title),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.description,
                    mapFrom((src: LiveSession) => src.description),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.scheduledAt,
                    mapFrom((src: LiveSession) => src.scheduledAt),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.duration,
                    mapFrom((src: LiveSession) => src.duration),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.status,
                    mapFrom((src: LiveSession) => src.status as any),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.meetingId,
                    mapFrom((src: LiveSession) => src.meetingId),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.createdAt,
                    mapFrom((src: LiveSession) => src.createdAt),
                ),
                forMember(
                    (dest: LiveSessionResponseDTO) => dest.updatedAt,
                    mapFrom((src: LiveSession) => src.updatedAt),
                ),
            );
        };
    }
}
