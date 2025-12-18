import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module'; // To get AUTH_SERVICE client

@Module({
    imports: [AuthModule],
    controllers: [UsersController],
})
export class AdminModule { }

