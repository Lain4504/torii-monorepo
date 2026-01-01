import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';
import { UsersModule } from './modules/users/users.module';
import { RBACModule } from './modules/rbac/rbac.module';

// HTTP Controllers (for client requests via Gateway)
import { AuthController } from './interfaces/http/auth.controller';
import { UsersController } from './interfaces/http/users.controller';
import { RBACController } from './interfaces/http/rbac.controller';
import { AuditLogController } from './interfaces/http/audit-log.controller';

// NATS Controllers - REMOVED (no longer needed for client requests)
// Keep only if needed for inter-service communication in the future

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    UsersModule,
    RBACModule,
  ],
  controllers: [
    // HTTP Controllers only
    AuthController,
    UsersController,
    RBACController,
    AuditLogController,
  ],
  providers: [],
  exports: [UsersModule, RBACModule],
})
export class IdentityModule { }
