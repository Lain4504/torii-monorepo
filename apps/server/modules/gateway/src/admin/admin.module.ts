import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { NatsClientModule, SharedModule } from '@server/shared';
import { RBACController } from '../../../identity/src/rbac/rbac.controller';
import { AuditLogController } from '../../../identity/src/rbac/audit-log.controller';
import { RBACService } from '../../../identity/src/rbac/rbac.service';
import { RBACConfigService } from '../../../identity/src/rbac/rbac-config.service';
import { RBACSeederService } from '../../../identity/src/rbac/rbac-seeder.service';

@Module({
    imports: [NatsClientModule, SharedModule],
    controllers: [UsersController, RBACController, AuditLogController],
    providers: [RBACService, RBACConfigService, RBACSeederService],
})
export class AdminModule { }
