import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { GoogleAuthService } from './google-auth.service';
import { UserIdentityRepository } from './user-identity.repository';
import { PrismaService, NatsClientModule, RedisModule } from '@server/shared';
import { JwtTokenProvider } from '@server/shared';
import { RBACModule } from '../rbac/rbac.module';
import { TwoFactorAuthModule } from '../two-factor-auth/two-factor-auth.module';

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
        RefreshTokenService,
        GoogleAuthService,
        UserIdentityRepository,
        PrismaService,
        JwtTokenProvider,
    ],
    exports: [AuthService, RefreshTokenService],
})
export class AuthModule { }


