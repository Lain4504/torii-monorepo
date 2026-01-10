import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserProfile } from '../../infrastructure/mappings/user.profile';
import { AuthorizationModule } from '../authorization/authorization.module';
import { EmailModule } from '../../infrastructure/email/email.module';
import { USERS_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { USERS_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * Users Feature Module
 * Handles user management and profile operations
 */
@Module({
    imports: [AuthorizationModule, EmailModule],
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
