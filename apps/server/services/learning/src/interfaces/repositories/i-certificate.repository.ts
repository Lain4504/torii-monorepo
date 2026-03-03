import type { Certificate, Prisma } from '@prisma/generated';

/**
 * Certificate Repository Interface
 * Defines the contract for all certificate data access operations
 */
export interface ICertificateRepository {
    /**
     * Find certificate by ID
     */
    findById(id: string): Promise<Certificate | null>;

    /**
     * Find certificate by certificate code
     */
    findByCode(code: string): Promise<Certificate | null>;

    /**
     * Find certificate by enrollment ID
     */
    findByEnrollmentId(enrollmentId: string): Promise<Certificate | null>;

    /**
     * Find all certificates with pagination and filters
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CertificateWhereInput;
        orderBy?: Prisma.CertificateOrderByWithRelationInput;
        include?: Prisma.CertificateInclude;
    }): Promise<Certificate[]>;

    /**
     * Count certificates with optional filter
     */
    count(where?: Prisma.CertificateWhereInput): Promise<number>;

    /**
     * Create a new certificate
     */
    create(data: Prisma.CertificateCreateInput): Promise<Certificate>;

    /**
     * Update certificate
     */
    update(id: string, data: Prisma.CertificateUpdateInput): Promise<Certificate>;

    /**
     * Delete certificate by ID
     */
    delete(id: string): Promise<void>;
}
