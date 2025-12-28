import { Module } from '@nestjs/common';
import { NatsClientModule, SharedModule } from '@server/shared';
import { AuthController } from './auth.controller';

@Module({
  imports: [NatsClientModule, SharedModule],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule { }
