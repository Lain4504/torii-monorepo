import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { CommunicationModule } from './communication.module';

async function bootstrap() {
  console.log('🚀 Communication Service starting...');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommunicationModule,
    createNatsServiceConfig(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen();
  console.log('📡 Communication Service NATS microservice listening');
}

bootstrap();
