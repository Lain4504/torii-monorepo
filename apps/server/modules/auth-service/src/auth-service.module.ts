import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule, SharedModule } from '@server/shared';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    SharedModule,
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService],
})
export class AuthServiceModule { }
