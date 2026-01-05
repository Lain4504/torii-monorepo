import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
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
        PrismaService,
        JwtTokenProvider,
    ],
    exports: [AuthService, RefreshTokenService],
})
export class AuthModule { }

