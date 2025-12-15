import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createTcpServiceConfig } from '@server/shared';

import { AuthServiceModule } from './auth-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    createTcpServiceConfig({
      hostEnvKey: 'AUTH_HOST',
      portEnvKey: 'AUTH_PORT',
      defaultPort: 8081,
    }),
  );

  await app.listen();
}

bootstrap();
