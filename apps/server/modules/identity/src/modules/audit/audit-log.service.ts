import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IAuditLogRepository } from '../../interfaces/repositories';
import type {
    AuditLogEntryDTO,
    AuditLogFiltersDTO,
    PaginatedResponseDTO,
    AuditLogResponseDTO,
    AuditLogActivityDTO,
} from '@workspace/schemas';
import type { IAuditLogService } from '../../interfaces/services';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import type { AuditLogWithUser } from '../audit/audit-log.repository';

@Injectable()
export class AuditLogService implements IAuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(
        @Inject(AUDIT_LOG_REPOSITORY_TOKEN) private readonly auditLogRepository: IAuditLogRepository,
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
    async query(filters: AuditLogFiltersDTO): Promise<PaginatedResponseDTO<AuditLogResponseDTO>> {
        const { page = 1, limit = 50, startDate, endDate, ...where } = filters;

        const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
        const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 50;

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

        const [rawData, total] = await Promise.all([
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
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            this.auditLogRepository.count(whereClause),
        ]);

        // Map Prisma AuditLog to AuditLogResponseDTO
        const data: AuditLogResponseDTO[] = rawData.map((log: AuditLogWithUser) => ({
            id: log.id,
            userId: log.userId,
            userEmail: log.userEmail,
            userRole: log.userRole,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            description: log.description,
            metadata: log.metadata as Record<string, unknown> | null,
            oldValues: log.oldValues as Record<string, unknown> | null,
            newValues: log.newValues as Record<string, unknown> | null,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            createdAt: log.createdAt,
            user: log.user ? {
                id: log.user.id,
                email: log.user.email,
                displayName: log.user.displayName,
                role: log.user.role,
            } : undefined,
        }));

        return {
            data,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }

    /**
     * Get recent activity for a user
     */
    async getUserActivity(userId: string, limit = 20): Promise<AuditLogActivityDTO[]> {
        return this.auditLogRepository.findByUserId(userId, limit);
    }

    /**
     * Get activity summary for entity
     */
    async getEntityActivity(entity: string, entityId: string, limit = 20): Promise<AuditLogActivityDTO[]> {
        return this.auditLogRepository.findByEntity(entity, entityId, limit);
    }
}
