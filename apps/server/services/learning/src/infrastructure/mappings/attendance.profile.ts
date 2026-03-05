import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, type Mapper } from '@automapper/core';
import type { Attendance } from '@prisma/generated';
import type { AttendanceResponseDTO } from '@workspace/schemas';

@Injectable()
export class AttendanceProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        'Attendance',
        'AttendanceResponseDTO',
        forMember(
          (dest: AttendanceResponseDTO) => dest.id,
          mapFrom((src: Attendance) => src.id),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.liveSessionId,
          mapFrom((src: Attendance) => src.liveSessionId),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.userId,
          mapFrom((src: Attendance) => src.userId),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.status,
          mapFrom((src: Attendance) => src.status as any),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.joinTime,
          mapFrom((src: Attendance) => src.joinTime),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.leaveTime,
          mapFrom((src: Attendance) => src.leaveTime),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.duration,
          mapFrom((src: Attendance) => src.duration),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.notes,
          mapFrom((src: Attendance) => src.notes),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.user,
          mapFrom((src: any) =>
            src.user
              ? {
                  id: src.user.id,
                  displayName: src.user.displayName,
                  email: src.user.email,
                  avatarUrl: src.user.avatarUrl,
                }
              : undefined,
          ),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.createdAt,
          mapFrom((src: Attendance) => src.createdAt),
        ),
        forMember(
          (dest: AttendanceResponseDTO) => dest.updatedAt,
          mapFrom((src: Attendance) => src.updatedAt),
        ),
      );
    };
  }
}
