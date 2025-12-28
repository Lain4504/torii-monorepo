import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    controllers: [UsersController],
    providers: [
        UsersService,
        ConfigService,
    ],
    exports: [UsersService],
})
export class UsersModule { }
