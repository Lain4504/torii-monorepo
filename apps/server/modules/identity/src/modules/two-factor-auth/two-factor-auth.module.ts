import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthController } from './two-factor-auth.controller';
import { TwoFactorAuthRepository } from './two-factor-auth.repository';
import { PrismaService, NatsClientModule, RedisModule, EncryptionModule } from '@server/shared';

/**
 * Two-Factor Authentication Module
 * Provides 2FA services and endpoints
 */
@Module({
    imports: [
        NatsClientModule,
        RedisModule,
        EncryptionModule,
    ],
    controllers: [TwoFactorAuthController],
    providers: [
        TwoFactorAuthService,
        TwoFactorAuthRepository,
        PrismaService,
    ],
    exports: [TwoFactorAuthService],
})
export class TwoFactorAuthModule { }
