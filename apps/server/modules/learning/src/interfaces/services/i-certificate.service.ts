import { CertificateResponseDTO, CertificateQueryDTO, CertificatePaginatedResponse } from '@workspace/schemas';

export interface ICertificateService {
    findAll(query: CertificateQueryDTO): Promise<CertificatePaginatedResponse>;
    findOne(id: string): Promise<CertificateResponseDTO | null>;
    findByCode(code: string): Promise<CertificateResponseDTO | null>;
    issueCertificate(userId: string, courseId: string, enrollmentId: string): Promise<CertificateResponseDTO>;
    verifyCertificate(code: string): Promise<{ valid: boolean; certificate?: CertificateResponseDTO }>;
}
