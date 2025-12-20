import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createTcpClientOptions } from '@server/shared';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ClientsModule.register([
      createTcpClientOptions({
        name: 'AUTH_SERVICE',
        hostEnvKey: 'AUTH_HOST',
        portEnvKey: 'AUTH_PORT',
        defaultPort: 8081,
      }),
    ]),
  ],
  controllers: [AuthController],
  exports: [ClientsModule],
})
export class AuthModule {}
