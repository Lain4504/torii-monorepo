import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
// Note: RBAC might be just a controller, checking existence of module later.
// Assuming RBAC has specific controllers but no module, or I need to check.
// If RBAC folder was moved, let's include it if it has a module.

import { RBACGatewayController, AuditLogGatewayController } from './rbac/rbac-gateway.controller';

import { NatsClientModule } from '@server/shared';

@Module({
    imports: [
        AdminModule,
        AuthModule,
        NatsClientModule,
    ],
    controllers: [RBACGatewayController, AuditLogGatewayController],
})
export class IdentityGatewayModule { }
