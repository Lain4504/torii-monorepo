import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenService } from './refresh-token.service';
import { PrismaService } from '@server/shared';
import { JwtTokenProvider } from '@server/shared';
import { RBACModule } from '../rbac/rbac.module';

/**
 * Auth Module
 * Provides authentication services
 */
@Module({
    imports: [RBACModule],
    providers: [
        AuthService,
        RefreshTokenService,
        PrismaService,
        JwtTokenProvider,
    ],
    exports: [AuthService, RefreshTokenService],
})
export class AuthModule { }
