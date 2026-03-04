import { CertificateResponseDTO, CertificateQueryDTO, CertificatePaginatedResponse } from '@workspace/schemas';

export interface ICertificateService {
    /**
     * Find all.
     */
    findAll(query: CertificateQueryDTO): Promise<CertificatePaginatedResponse>;
    /**
     * Find by id.
     */
    findById(id: string): Promise<CertificateResponseDTO | null>;
    /**
     * Find by code.
     */
    findByCode(code: string): Promise<CertificateResponseDTO | null>;
    /**
     * Execute issue certificate operation.
     */
    issueCertificate(userId: string, courseRunId: string, enrollmentId: string): Promise<CertificateResponseDTO>;
    /**
     * Verify certificate.
     */
    verifyCertificate(code: string): Promise<{ valid: boolean; certificate?: CertificateResponseDTO }>;
}
