import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RBACModule } from './modules/rbac/rbac.module';
import { AuditModule } from './modules/audit/audit.module';
import { TwoFactorAuthModule } from './modules/two-factor-auth/two-factor-auth.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EmailModule } from './infrastructure/email/email.module';

// HTTP Controllers (external via API Gateway)
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { RBACController } from './controllers/rbac.controller';
import { AuditLogController } from './controllers/audit-log.controller';
import { TwoFactorAuthController } from './controllers/two-factor-auth.controller';
import { EMAIL_SERVICE_TOKEN } from './interfaces/services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    RBACModule,
    AuditModule,
    TwoFactorAuthModule,
    PaymentsModule,
    EmailModule,
  ],
  controllers: [
    // HTTP Controllers (public via Gateway)
    AuthController,
    UsersController,
    RBACController,
    AuditLogController,
    TwoFactorAuthController
  ],
  providers: [],
  exports: [
    AuthModule,
    UsersModule,
    RBACModule,
    AuditModule,
    TwoFactorAuthModule,
    PaymentsModule,
    EmailModule
  ],
})
export class IdentityModule { }
