import { Module } from '@nestjs/common';
import { RBACService } from './rbac.service';
import { RBACConfigService } from './rbac-config.service';
import { RBACSeederService } from './rbac-seeder.service';
import { SharedModule } from '@server/shared';

@Module({
    imports: [SharedModule],
    providers: [
        RBACService,
        RBACConfigService,
        RBACSeederService,
        // AuditLogService // Uncomment if it exists
    ],
    exports: [
        RBACService,
        RBACConfigService,
        RBACSeederService,
    ],
})
export class RBACModule { }
