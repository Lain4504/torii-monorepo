import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { AgentsModule } from './agents.module';

async function bootstrap() {
  console.log('🚀 Agents Service starting...');

  // Create NATS microservice (connection only)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AgentsModule,
    createNatsServiceConfig(),
  );

  // Enable validation pipe for DTOs in NATS messages
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen();
  console.log('📡 Agents Service NATS microservice listening');
}

bootstrap();
