import { Controller, UsePipes } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CERTIFICATE_SERVICE_TOKEN, ICertificateService } from '@server/learning/interfaces/services';
import {
    CertificateQueryDTO,
    certificateQueryDTOSchema,
    CertificateIssueDTO,
    certificateIssueDTOSchema
} from '@workspace/schemas';
import { ZodValidationPipe } from '@server/shared';

@Controller()
export class CertificateHandler {
    constructor(
        @Inject(CERTIFICATE_SERVICE_TOKEN) private readonly certificateService: ICertificateService
    ) { }

    @MessagePattern({ cmd: 'learning.certificate.findAll' })
    @UsePipes(new ZodValidationPipe(certificateQueryDTOSchema))
    async findAll(@Payload() query: CertificateQueryDTO) {
        return this.certificateService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.certificate.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.certificateService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.certificate.findByCode' })
    async findByCode(@Payload() data: { code: string }) {
        return this.certificateService.findByCode(data.code);
    }

    @MessagePattern({ cmd: 'learning.certificate.verify' })
    async verify(@Payload() data: { code: string }) {
        return this.certificateService.verifyCertificate(data.code);
    }

    @MessagePattern({ cmd: 'learning.certificate.issue' })
    @UsePipes(new ZodValidationPipe(certificateIssueDTOSchema))
    async issue(@Payload() data: CertificateIssueDTO) {
        return this.certificateService.issueCertificate(data.userId, data.courseMasterId, data.enrollmentId);
    }
}

