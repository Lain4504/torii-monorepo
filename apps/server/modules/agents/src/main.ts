import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { AgentsModule } from './agents.module';
import cookieParser from 'cookie-parser';

import * as bodyParser from 'body-parser';

async function bootstrap() {
  // 1. Create HTTP application
  const httpApp = await NestFactory.create(AgentsModule);

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

  const HTTP_PORT = process.env.AGENTS_HTTP_PORT || 8090;
  await httpApp.listen(HTTP_PORT);
  console.log(`🚀 Agents Service HTTP listening on port ${HTTP_PORT}`);

  // 2. Create NATS microservice
  const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    AgentsModule,
    createNatsServiceConfig(),
  );

  await natsApp.listen();
  console.log('📡 Agents Service NATS microservice listening');
}

bootstrap();
