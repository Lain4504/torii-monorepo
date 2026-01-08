import { Module } from '@nestjs/common';
import { RedisModule } from '@server/shared';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { GoogleAuthService } from './google-auth.service';
import { UserIdentityRepository } from './user-identity.repository';
import { AuthorizationModule } from '../authorization/authorization.module';
import { TwoFactorAuthModule } from '../two-factor-auth/two-factor-auth.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../../infrastructure/email/email.module';
import {
    AUTH_SERVICE_TOKEN,
    SESSION_SERVICE_TOKEN,
    GOOGLE_AUTH_SERVICE_TOKEN,
} from '../../interfaces/services';
import {
    USER_IDENTITY_REPOSITORY_TOKEN,
} from '../../interfaces/repositories';

/**
 * Authentication Feature Module
 * Handles authentication, authorization, and session management
 */
@Module({
    imports: [
        RedisModule,
        AuthorizationModule,
        TwoFactorAuthModule,
        UsersModule,
        EmailModule,
    ],
    providers: [
        {
            provide: AUTH_SERVICE_TOKEN,
            useClass: AuthService,
        },
        {
            provide: SESSION_SERVICE_TOKEN,
            useClass: SessionService,
        },
        {
            provide: GOOGLE_AUTH_SERVICE_TOKEN,
            useClass: GoogleAuthService,
        },
        {
            provide: USER_IDENTITY_REPOSITORY_TOKEN,
            useClass: UserIdentityRepository,
        },
    ],
    exports: [
        AUTH_SERVICE_TOKEN,
        SESSION_SERVICE_TOKEN,
        GOOGLE_AUTH_SERVICE_TOKEN,
    ],
})
export class AuthModule { }
