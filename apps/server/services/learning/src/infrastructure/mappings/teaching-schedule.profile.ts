import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { TeachingScheduleResponseDTO, ScheduleRequestResponseDTO } from '@workspace/schemas';

/**
 * TeachingSchedule AutoMapper Profile
 * Maps TeachingSchedule and LiveSessionScheduleRequest entities to their DTOs
 */
@Injectable()
export class TeachingScheduleProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            // TeachingSchedule → TeachingScheduleResponseDTO
            createMap(
                mapper,
                'TeachingSchedule',
                'TeachingScheduleResponseDTO',
                forMember(
                    (dest: TeachingScheduleResponseDTO) => dest.id,
                    mapFrom((src: any) => src.id),
                ),
                forMember(
                    (dest: TeachingScheduleResponseDTO) => dest.lecturerId,
                    mapFrom((src: any) => src.lecturerId),
                ),
                forMember(
                    (dest: TeachingScheduleResponseDTO) => dest.dayOfWeek,
                    mapFrom((src: any) => src.dayOfWeek),
                ),
                forMember(
                    (dest: TeachingScheduleResponseDTO) => dest.startTime,
                    mapFrom((src: any) => src.startTime),
                ),
                forMember(
                    (dest: TeachingScheduleResponseDTO) => dest.duration,
                    mapFrom((src: any) => src.duration),
                ),
                forMember(
                    (dest: TeachingScheduleResponseDTO) => dest.createdAt,
                    mapFrom((src: any) => src.createdAt),
                ),
                forMember(
                    (dest: TeachingScheduleResponseDTO) => dest.updatedAt,
                    mapFrom((src: any) => src.updatedAt),
                ),
                forMember(
                    (dest: TeachingScheduleResponseDTO) => dest.lecturer,
                    mapFrom((src: any) =>
                        src.lecturer
                            ? { id: src.lecturer.id, displayName: src.lecturer.displayName }
                            : undefined,
                    ),
                ),
            );

            // LiveSessionScheduleRequest → ScheduleRequestResponseDTO
            createMap(
                mapper,
                'LiveSessionScheduleRequest',
                'ScheduleRequestResponseDTO',
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.id,
                    mapFrom((src: any) => src.id),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.lecturerId,
                    mapFrom((src: any) => src.lecturerId),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.originalScheduleId,
                    mapFrom((src: any) => src.originalScheduleId),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.dayOfWeek,
                    mapFrom((src: any) => src.dayOfWeek),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.startTime,
                    mapFrom((src: any) => src.startTime),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.duration,
                    mapFrom((src: any) => src.duration),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.reason,
                    mapFrom((src: any) => src.reason),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.status,
                    mapFrom((src: any) => src.status),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.createdAt,
                    mapFrom((src: any) => src.createdAt),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.updatedAt,
                    mapFrom((src: any) => src.updatedAt),
                ),
                forMember(
                    (dest: ScheduleRequestResponseDTO) => dest.lecturer,
                    mapFrom((src: any) =>
                        src.lecturer
                            ? { id: src.lecturer.id, displayName: src.lecturer.displayName }
                            : undefined,
                    ),
                ),
            );
        };
    }
}
