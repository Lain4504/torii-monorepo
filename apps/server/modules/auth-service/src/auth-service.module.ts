import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule, SharedModule } from '@server/shared';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthServiceModule {}
