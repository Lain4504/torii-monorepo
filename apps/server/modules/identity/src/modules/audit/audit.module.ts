import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogRepository } from './audit-log.repository';
import { AUDIT_LOG_SERVICE_TOKEN } from '../../interfaces/services';
import { AUDIT_LOG_REPOSITORY_TOKEN } from '../../interfaces/repositories';

/**
 * Audit Logging Feature Module  
 * Handles activity tracking and audit trails
 */
@Module({
    providers: [
        {
            provide: AUDIT_LOG_SERVICE_TOKEN,
            useClass: AuditLogService,
        },
        {
            provide: AUDIT_LOG_REPOSITORY_TOKEN,
            useClass: AuditLogRepository,
        },
    ],
    exports: [AUDIT_LOG_SERVICE_TOKEN],
})
export class AuditModule { }
