import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface AuditLogEntry {
    userId: string;
    userEmail: string;
    userRole: string;
    action: string;
    entity: string;
    entityId?: string;
    description: string;
    metadata?: Record<string, any>;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

export interface AuditLogFilters {
    userId?: string;
    action?: string;
    entity?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

export interface PaginatedAuditLogs {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Log an action to the audit log
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            console.log('📝 AuditLog.log() called with entry:', {
                userId: entry.userId,
                userEmail: entry.userEmail,
                action: entry.action,
                entity: entry.entity,
            });

            await this.prisma.auditLog.create({
                data: {
                    userId: entry.userId,
                    userEmail: entry.userEmail,
                    userRole: entry.userRole,
                    action: entry.action,
                    entity: entry.entity,
                    entityId: entry.entityId,
                    description: entry.description,
                    metadata: entry.metadata || {},
                    oldValues: entry.oldValues,
                    newValues: entry.newValues,
                    ipAddress: entry.ipAddress,
                    userAgent: entry.userAgent,
                },
            });

            this.logger.log(`Audit: ${entry.action} by ${entry.userEmail} on ${entry.entity}`);
            console.log('✅ Audit log created successfully');
        } catch (error) {
            this.logger.error('Failed to create audit log:', error);
            console.error('❌ Audit log creation failed:', error);
            // Don't throw - audit log failures shouldn't break the main operation
        }
    }

    /**
     * Query audit logs with filters and pagination
     */
    async query(filters: AuditLogFilters): Promise<PaginatedAuditLogs> {
        const { page = 1, limit = 50, startDate, endDate, ...where } = filters;

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: {
                    userId: where.userId,
                    action: where.action,
                    entity: where.entity,
                    entityId: where.entityId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            displayName: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.auditLog.count({
                where: {
                    userId: where.userId,
                    action: where.action,
                    entity: where.entity,
                    entityId: where.entityId,
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get recent activity for a user
     */
    async getUserActivity(userId: string, limit = 20): Promise<any[]> {
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
     * Get activity summary for entity
     */
    async getEntityActivity(entity: string, entityId: string, limit = 20): Promise<any[]> {
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
}
