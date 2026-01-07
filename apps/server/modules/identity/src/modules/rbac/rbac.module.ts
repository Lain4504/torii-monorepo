import { Module } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { RBACConfigService } from './rbac-config.service';
import { RBACSeederService } from './rbac-seeder.service';
import { AuditModule } from '../audit/audit.module';
import { RBAC_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * RBAC (Role-Based Access Control) Feature Module
 * Handles permissions, roles, and access control
 */
@Module({
    imports: [AuditModule],
    providers: [
        {
            provide: RBAC_SERVICE_TOKEN,
            useClass: RBACService,
        },
        RBACConfigService,
        RBACSeederService,
    ],
    exports: [
        RBAC_SERVICE_TOKEN,
        RBACConfigService,
        RBACSeederService,
    ],
})
export class RBACModule { }
