import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { RBACModule } from '../rbac/rbac.module';

@Module({
    imports: [RBACModule],
    controllers: [],
    providers: [
        UsersService,
        ConfigService,
    ],
    exports: [UsersService],
})
export class UsersModule { }
