import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { UsersModule } from '../users/users.module';

/**
 * Auth Module - Deprecated
 * Authentication is now handled by Firebase
 * This module is kept for backward compatibility only
 */
@Module({
    imports: [
        SharedModule,
        UsersModule,
    ],
    providers: [],
    exports: [],
})
export class AuthModule { }
