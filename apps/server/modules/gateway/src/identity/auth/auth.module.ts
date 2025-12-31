import { Module } from '@nestjs/common';
import { NatsClientModule, SharedModule } from '@server/shared';

@Module({
  imports: [NatsClientModule, SharedModule],
  controllers: [],
  exports: [],
})
export class AuthModule { }
