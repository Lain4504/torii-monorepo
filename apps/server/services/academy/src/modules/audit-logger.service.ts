import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';

@Injectable()
export class AuditLoggerService {
    private readonly logger = new Logger(AuditLoggerService.name);

    constructor(private readonly prisma: PrismaService) { }

    async log(params: {
        userId: string;
        action: string;
        entity: string;
        entityId?: string;
        description: string;
        metadata?: any;
        oldValues?: any;
        newValues?: any;
    }) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: params.userId,
                    action: params.action,
                    entity: params.entity,
                    entityId: params.entityId,
                    description: params.description,
                    metadata: params.metadata || {},
                    oldValues: params.oldValues || {},
                    newValues: params.newValues || {},
                },
            });
        } catch (error) {
            this.logger.error(`Failed to create audit log for ${params.action}:`, error.message);
        }
    }
}
