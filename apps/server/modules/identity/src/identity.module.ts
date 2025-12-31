import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RBACModule } from './modules/rbac/rbac.module';

import { UsersController } from './interfaces/nats/users.controller';
import { RBACController } from './interfaces/nats/rbac.controller';
import { AuditLogController } from './interfaces/nats/audit-log.controller';
import { FirebaseSyncController } from './interfaces/nats/firebase-sync.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    UsersModule,
    AuthModule,
    RBACModule,
  ],
  controllers: [UsersController, RBACController, AuditLogController, FirebaseSyncController],
  providers: [],
  exports: [AuthModule, UsersModule, RBACModule],
})
export class IdentityModule { }
