import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { RBACModule } from '../rbac/rbac.module';

@Module({
    imports: [RBACModule],
    controllers: [],
    providers: [
        UsersService,
        UsersRepository,
        ConfigService,
    ],
    exports: [UsersService],
})
export class UsersModule { }
