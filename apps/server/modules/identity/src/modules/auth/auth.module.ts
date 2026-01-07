import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { GoogleAuthService } from './google-auth.service';
import { UserIdentityRepository } from './user-identity.repository';
import { PrismaService, NatsClientModule, RedisModule } from '@server/shared';
import { JwtTokenProvider } from '@server/shared';
import { RBACModule } from '../rbac/rbac.module';
import { TwoFactorAuthModule } from '../two-factor-auth/two-factor-auth.module';
import { UsersRepository } from '../users/users.repository';

/**
 * Auth Module
 * Provides authentication services
 */
@Module({
    imports: [
        RBACModule,
        TwoFactorAuthModule,
        NatsClientModule,
        RedisModule,
    ],
    providers: [
        AuthService,
        SessionService,
        GoogleAuthService,
        UserIdentityRepository,
        UsersRepository,
        PrismaService,
        JwtTokenProvider,
    ],
    exports: [AuthService, SessionService],
})
export class AuthModule { }


