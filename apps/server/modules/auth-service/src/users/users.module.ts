import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RBACService } from '../rbac/rbac.service';
import { RBACConfigService } from '../rbac/rbac-config.service';

@Module({
    controllers: [UsersController],
    providers: [
        UsersService,
        ConfigService,
        RBACService,
        RBACConfigService,
    ],
    exports: [UsersService],
})
export class UsersModule { }
