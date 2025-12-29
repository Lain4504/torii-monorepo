import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { IdentityModule } from './identity.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    createNatsServiceConfig(),
  );

  await app.listen();
  console.log('Auth Microservice is listening on NATS...');
}

bootstrap();
