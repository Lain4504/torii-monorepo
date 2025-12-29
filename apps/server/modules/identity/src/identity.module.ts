import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { RBACService } from './rbac/rbac.service';
import { RBACConfigService } from './rbac/rbac-config.service';
import { RBACSeederService } from './rbac/rbac-seeder.service';
import { RBACController } from './rbac/rbac.controller';
import { AuditLogController } from './rbac/audit-log.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule, // Provides JwtTokenProvider
    UsersModule,  // Exports PrismaClient
  ],
  controllers: [AuthController, UsersController, RBACController, AuditLogController],
  providers: [AuthService, UsersService, RBACConfigService, RBACSeederService, RBACService],
  exports: [AuthService, UsersService, RBACConfigService, RBACService],
})
export class IdentityModule { }
