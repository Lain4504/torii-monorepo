import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { SharedModule } from '@server/shared';

// Feature modules
import { AuthModule } from '@server/identity/modules/auth/auth.module';
import { UsersModule } from '@server/identity/modules/users/users.module';
import { AuthorizationModule } from '@server/identity/modules/authorization/authorization.module';
import { AuditModule } from '@server/identity/modules/audit/audit.module';
import { TwoFactorAuthModule } from '@server/identity/modules/two-factor-auth/two-factor-auth.module';
import { PaymentsModule } from '@server/identity/modules/payments/payments.module';

// NATS Handlers (replacing HTTP controllers)
import { AuthHandler } from '@server/identity/interfaces/nats/auth.handler';
import { UsersHandler } from '@server/identity/interfaces/nats/users.handler';
import { AuthorizationHandler } from '@server/identity/interfaces/nats/authorization.handler';
import { AuditLogHandler } from '@server/identity/interfaces/nats/audit-log.handler';
import { TwoFactorAuthHandler } from '@server/identity/interfaces/nats/two-factor-auth.handler';
import { AnalyticsHandler } from '@server/identity/interfaces/nats/analytics.handler';

// Filters
import { GlobalRpcExceptionFilter } from '@server/shared';

// Services
import { DefaultAdminService } from '@server/identity/services/default-admin.service';

@Module({
  imports: [
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
  ],
  controllers: [
    // NATS Handlers (not HTTP controllers)
    AuthHandler,
    UsersHandler,
    AuthorizationHandler,
    AuditLogHandler,
    TwoFactorAuthHandler,
    AnalyticsHandler,
  ],
  providers: [
    // Global RPC exception filter for Identity module
    {
      provide: APP_FILTER,
      useClass: GlobalRpcExceptionFilter,
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
  ],
})
export class IdentityModule { }
