import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { SharedModule } from '@server/shared';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { AuditModule } from './modules/audit/audit.module';
import { TwoFactorAuthModule } from './modules/two-factor-auth/two-factor-auth.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EmailModule } from './infrastructure/email/email.module';

// HTTP Controllers (external via API Gateway)
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { AuthorizationController } from './controllers/authorization.controller';
import { AuditLogController } from './controllers/audit-log.controller';
import { TwoFactorAuthController } from './controllers/two-factor-auth.controller';
import { EMAIL_SERVICE_TOKEN } from './interfaces/services';

// Filters
import { IdentityHttpExceptionFilter } from './filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AutomapperModule.forRoot({
      strategyInitializer: pojos(),
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    AuthorizationModule,
    AuditModule,
    TwoFactorAuthModule,
    PaymentsModule,
    EmailModule,
  ],
  controllers: [
    // HTTP Controllers (public via Gateway)
    AuthController,
    UsersController,
    AuthorizationController,
    AuditLogController,
    TwoFactorAuthController
  ],
  providers: [
    // Global exception filter for Identity module
    {
      provide: APP_FILTER,
      useClass: IdentityHttpExceptionFilter,
    },
  ],
  exports: [
    AuthModule,
    UsersModule,
    AuthorizationModule,
    AuditModule,
    TwoFactorAuthModule,
    PaymentsModule,
    EmailModule
  ],
})
export class IdentityModule { }
