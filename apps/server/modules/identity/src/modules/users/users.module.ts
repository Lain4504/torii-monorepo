import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { RBACModule } from '../rbac/rbac.module';
import { USERS_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { USERS_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * Users Feature Module
 * Handles user management and profile operations
 */
@Module({
    imports: [RBACModule],
    providers: [
        {
            provide: USERS_REPOSITORY_TOKEN,
            useClass: UsersRepository,
        },
        {
            provide: USERS_SERVICE_TOKEN,
            useClass: UsersService,
        },
    ],
    exports: [USERS_SERVICE_TOKEN, USERS_REPOSITORY_TOKEN],
})
export class UsersModule { }
