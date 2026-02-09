import { Module } from '@nestjs/common';
import { RedisModule } from '@server/shared';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthRepository } from './two-factor-auth.repository';
import {
    TWO_FACTOR_AUTH_SERVICE_TOKEN,
} from '@server/identity/interfaces/services';
import {
    TWO_FACTOR_AUTH_REPOSITORY_TOKEN,
} from '@server/identity/interfaces/repositories';

/**
 * Two-Factor Authentication Feature Module
 * Handles TOTP setup, verification, and backup codes
 */
@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: TWO_FACTOR_AUTH_SERVICE_TOKEN,
            useClass: TwoFactorAuthService,
        },
        {
            provide: TWO_FACTOR_AUTH_REPOSITORY_TOKEN,
            useClass: TwoFactorAuthRepository,
        },
    ],
    exports: [TWO_FACTOR_AUTH_SERVICE_TOKEN],
})
export class TwoFactorAuthModule { }

