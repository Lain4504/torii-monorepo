import { Injectable, Logger } from '@nestjs/common';
import { AuditLogRepository } from "./audit-log.repository";
import type {
    AuditLogEntryDTO,
    AuditLogFiltersDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(
        private readonly auditLogRepository: AuditLogRepository,
    ) { }

    /**
     * Log an action to the audit log
     */
    async log(entry: AuditLogEntryDTO): Promise<void> {
        try {
            console.log('📝 AuditLog.log() called with entry:', {
                userId: entry.userId,
                userEmail: entry.userEmail,
                action: entry.action,
                entity: entry.entity,
            });

            await this.auditLogRepository.create({
                user: {
                    connect: { id: entry.userId },
                },
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
    async query(filters: AuditLogFiltersDTO): Promise<PaginatedResponseDTO<any>> {
        const { page = 1, limit = 50, startDate, endDate, ...where } = filters;

        const whereClause = {
            userId: where.userId,
            action: where.action,
            entity: where.entity,
            entityId: where.entityId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        const [data, total] = await Promise.all([
            this.auditLogRepository.findMany({
                where: whereClause,
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
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.auditLogRepository.count(whereClause),
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
        return this.auditLogRepository.findByUserId(userId, limit);
    }

    /**
     * Get activity summary for entity
     */
    async getEntityActivity(entity: string, entityId: string, limit = 20): Promise<any[]> {
        return this.auditLogRepository.findByEntity(entity, entityId, limit);
    }
}
