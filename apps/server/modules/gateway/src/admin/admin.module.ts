import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { NatsClientModule, SharedModule } from '@server/shared';
import { RBACController } from '../../../auth-service/src/rbac/rbac.controller';
import { AuditLogController } from '../../../auth-service/src/rbac/audit-log.controller';
import { RBACService } from '../../../auth-service/src/rbac/rbac.service';
import { RBACConfigService } from '../../../auth-service/src/rbac/rbac-config.service';
import { RBACSeederService } from '../../../auth-service/src/rbac/rbac-seeder.service';

@Module({
    imports: [NatsClientModule, SharedModule],
    controllers: [UsersController, RBACController, AuditLogController],
    providers: [RBACService, RBACConfigService, RBACSeederService],
})
export class AdminModule { }
