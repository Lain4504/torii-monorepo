import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserProfile } from '@server/identity/infrastructure/mappings/user.profile';
import { AuthorizationModule } from '../authorization/authorization.module';
import { USERS_REPOSITORY_TOKEN } from '@server/identity/interfaces/repositories';
import { USERS_SERVICE_TOKEN } from '@server/identity/interfaces/services';

/**
 * Users Feature Module
 * Handles user management and profile operations
 */
@Module({
    imports: [PrismaModule, NatsClientModule, AuthorizationModule],
    providers: [
        {
            provide: USERS_REPOSITORY_TOKEN,
            useClass: UsersRepository,
        },
        {
            provide: USERS_SERVICE_TOKEN,
            useClass: UsersService,
        },
        UserProfile,
    ],
    exports: [USERS_SERVICE_TOKEN, USERS_REPOSITORY_TOKEN],
})
export class UsersModule { }

