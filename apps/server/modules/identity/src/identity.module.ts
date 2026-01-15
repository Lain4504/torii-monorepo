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

// NATS Handlers (replacing HTTP controllers)
import { AuthHandler } from './interfaces/nats/auth.handler';
import { UsersHandler } from './interfaces/nats/users.handler';
import { AuthorizationHandler } from './interfaces/nats/authorization.handler';
import { AuditLogHandler } from './interfaces/nats/audit-log.handler';
import { TwoFactorAuthHandler } from './interfaces/nats/two-factor-auth.handler';

// Filters
import { IdentityHttpExceptionFilter } from './filters/http-exception.filter';

// Services
import { DefaultAdminService } from './services/default-admin.service';

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
    // NATS Handlers (not HTTP controllers)
    AuthHandler,
    UsersHandler,
    AuthorizationHandler,
    AuditLogHandler,
    TwoFactorAuthHandler,
  ],
  providers: [
    // Global exception filter for Identity module
    {
      provide: APP_FILTER,
      useClass: IdentityHttpExceptionFilter,
    },
    // Default admin creation service
    DefaultAdminService,
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
