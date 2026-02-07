import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Certificate, Prisma } from '@prisma/generated';
import type { ICertificateRepository } from '../../interfaces/repositories';

/**
 * Certificate Repository
 * Handles all database operations for Certificate entity
 */
@Injectable()
export class CertificateRepository implements ICertificateRepository {
    private readonly logger = new Logger(CertificateRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find certificate by ID
     */
    async findById(id: string): Promise<Certificate | null> {
        return this.prisma.certificate.findUnique({
            where: { id },
        });
    }

    /**
     * Find certificate by certificate code
     */
    async findByCode(code: string): Promise<Certificate | null> {
        return this.prisma.certificate.findUnique({
            where: { certificateCode: code },
        });
    }

    /**
     * Find certificate by enrollment ID
     */
    async findByEnrollmentId(enrollmentId: string): Promise<Certificate | null> {
        return this.prisma.certificate.findUnique({
            where: { enrollmentId },
        });
    }

    /**
     * Find all certificates with pagination and filters
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CertificateWhereInput;
        orderBy?: Prisma.CertificateOrderByWithRelationInput;
        include?: Prisma.CertificateInclude;
    }): Promise<Certificate[]> {
        return this.prisma.certificate.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { issueDate: 'desc' },
            include: options.include,
        });
    }

    /**
     * Count certificates with optional filter
     */
    async count(where?: Prisma.CertificateWhereInput): Promise<number> {
        return this.prisma.certificate.count({
            where,
        });
    }

    /**
     * Create a new certificate
     */
    async create(data: Prisma.CertificateCreateInput): Promise<Certificate> {
        return this.prisma.certificate.create({
            data,
        });
    }

    /**
     * Update certificate
     */
    async update(id: string, data: Prisma.CertificateUpdateInput): Promise<Certificate> {
        return this.prisma.certificate.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete certificate by ID
     */
    async delete(id: string): Promise<void> {
        await this.prisma.certificate.delete({
            where: { id },
        });
    }
}
