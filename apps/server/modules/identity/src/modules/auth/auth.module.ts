import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SharedModule } from '@server/shared';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        SharedModule,
        UsersModule,
    ],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule { }
