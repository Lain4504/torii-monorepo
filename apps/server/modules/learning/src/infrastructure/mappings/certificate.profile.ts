import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { createMap, forMember, mapFrom } from '@automapper/core';
import type { Certificate } from '@prisma/generated';
import type { CertificateResponseDTO } from '@workspace/schemas';

/**
 * Certificate AutoMapper Profile
 * Maps Certificate entity (Prisma) to CertificateResponseDTO
 */
@Injectable()
export class CertificateProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(
                mapper,
                'Certificate',
                'CertificateResponseDTO',
                forMember(
                    (dest: CertificateResponseDTO) => dest.id,
                    mapFrom((src: Certificate) => src.id),
                ),
                forMember(
                    (dest: CertificateResponseDTO) => dest.userId,
                    mapFrom((src: Certificate) => src.userId),
                ),
                forMember(
                    (dest: CertificateResponseDTO) => dest.courseId,
                    mapFrom((src: Certificate) => src.courseId),
                ),
                forMember(
                    (dest: CertificateResponseDTO) => dest.enrollmentId,
                    mapFrom((src: Certificate) => src.enrollmentId),
                ),
                forMember(
                    (dest: CertificateResponseDTO) => dest.certificateCode,
                    mapFrom((src: Certificate) => src.certificateCode),
                ),
                forMember(
                    (dest: CertificateResponseDTO) => dest.issueDate,
                    mapFrom((src: Certificate) => src.issueDate),
                ),
                forMember(
                    (dest: CertificateResponseDTO) => dest.fileUrl,
                    mapFrom((src: Certificate) => src.fileUrl),
                ),
                forMember(
                    (dest: CertificateResponseDTO) => dest.metadata,
                    mapFrom((src: Certificate) => (src.metadata as any) || {}),
                ),
            );
        };
    }
}
