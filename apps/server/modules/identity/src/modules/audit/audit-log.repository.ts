import { Injectable } from "@nestjs/common";
import { PrismaService } from "@server/shared";
import { Prisma, AuditLog } from "@prisma/generated";
import type { IAuditLogRepository } from '../../interfaces/repositories';

/**
 * Audit Log Repository
 * Handles all database operations for AuditLog entity
 */
@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Create new audit log entry
     */
    async create(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
        return this.prisma.auditLog.create({ data });
    }

    /**
     * Find many audit logs with filters and pagination
     */
    async findMany(options: {
        where?: Prisma.AuditLogWhereInput;
        include?: Prisma.AuditLogInclude;
        orderBy?: Prisma.AuditLogOrderByWithRelationInput;
        skip?: number;
        take?: number;
    }): Promise<AuditLog[]> {
        return this.prisma.auditLog.findMany({
            where: options.where,
            include: options.include,
            orderBy: options.orderBy || { createdAt: 'desc' },
            skip: options.skip,
            take: options.take,
        });
    }

    /**
     * Count audit logs with optional filter
     */
    async count(where?: Prisma.AuditLogWhereInput): Promise<number> {
        return this.prisma.auditLog.count({ where });
    }

    /**
     * Get recent activity for a user
     */
    async findByUserId(userId: string, limit: number = 20): Promise<any[]> {
        return this.prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                    },
                },
            },
        });
    }

    /**
     * Get activity for a specific entity
     */
    async findByEntity(entity: string, entityId: string, limit: number = 20): Promise<any[]> {
        return this.prisma.auditLog.findMany({
            where: { entity, entityId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                    },
                },
            },
        });
    }

    /**
     * Delete old audit logs (for cleanup/retention policies)
     */
    async deleteOlderThan(date: Date): Promise<number> {
        const result = await this.prisma.auditLog.deleteMany({
            where: {
                createdAt: {
                    lt: date,
                },
            },
        });
        return result.count;
    }
}
