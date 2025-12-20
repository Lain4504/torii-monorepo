import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { AuthController } from './auth.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [AuthController],
  exports: [],
})
export class AuthModule {}
