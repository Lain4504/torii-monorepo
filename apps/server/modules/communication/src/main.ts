import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { CommunicationModule } from './communication.module';
import cookieParser from 'cookie-parser';

import * as bodyParser from 'body-parser';

async function bootstrap() {
  // 1. Create HTTP application
  const httpApp = await NestFactory.create(CommunicationModule);

  // Configure body parser
  httpApp.use(bodyParser.json({ limit: '10mb' }));
  httpApp.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  // Configure cookie parser - REQUIRED for web auth with httpOnly cookies
  httpApp.use(cookieParser());

  // Enable CORS
  // CORS handled by Gateway
  // httpApp.enableCors({...});

  // Global validation pipe
  httpApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const HTTP_PORT = process.env.COMMUNICATION_HTTP_PORT || 8083;
  await httpApp.listen(HTTP_PORT);
  console.log(`🚀 Communication Service HTTP listening on port ${HTTP_PORT}`);

  // 2. Create NATS microservice (optional, keep for inter-service)
  const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    CommunicationModule,
    createNatsServiceConfig(),
  );

  await natsApp.listen();
  console.log('📡 Communication Service NATS microservice listening');
}

bootstrap();
