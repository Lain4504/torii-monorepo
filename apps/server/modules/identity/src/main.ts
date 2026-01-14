import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { IdentityModule } from './identity.module';
import cookieParser from 'cookie-parser';

import * as bodyParser from 'body-parser';

async function bootstrap() {
  // 1. Create HTTP application (for client requests)
  const httpApp = await NestFactory.create(IdentityModule);

  // Configure body parser
  httpApp.use(bodyParser.json({ limit: '10mb' }));
  httpApp.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Configure cookie parser - REQUIRED for web auth with httpOnly cookies
  httpApp.use(cookieParser());

  // Enable CORS
  // CORS handled by Gateway
  // httpApp.enableCors({...});

  // Global validation pipe
  httpApp.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Start HTTP server on port 8081
  const HTTP_PORT = process.env.IDENTITY_HTTP_PORT || 8081;
  await httpApp.listen(HTTP_PORT, '0.0.0.0');
  console.log(`🚀 Identity Service HTTP listening on port ${HTTP_PORT}`);

  // 2. Create NATS microservice (for inter-service communication)
  const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    createNatsServiceConfig(),
  );

  await natsApp.listen();
  console.log('📡 Identity Service NATS microservice listening');
}

bootstrap();
