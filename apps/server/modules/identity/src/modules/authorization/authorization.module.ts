import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { AuthorizationService } from './authorization.service';
import { AuthorizationConfigService } from './authorization-config.service';
import { AuthorizationSeederService } from './authorization-seeder.service';
import { AuthorizationMessagingController } from '../../messaging/authorization.messaging';
import { AuditModule } from '../audit/audit.module';
import { AUTHORIZATION_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * Authorization Feature Module
 * Handles permissions, roles, and access control
 */
@Module({
    imports: [PrismaModule, NatsClientModule, AuditModule],
    controllers: [AuthorizationMessagingController],
    providers: [
        {
            provide: AUTHORIZATION_SERVICE_TOKEN,
            useClass: AuthorizationService,
        },
        AuthorizationConfigService,
        AuthorizationSeederService,
    ],
    exports: [
        AUTHORIZATION_SERVICE_TOKEN,
        AuthorizationConfigService,
        AuthorizationSeederService,
    ],
})
export class AuthorizationModule { }

