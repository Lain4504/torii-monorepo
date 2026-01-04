import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { LmsModule } from './lms.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // 1. Create HTTP application
  const httpApp = await NestFactory.create(LmsModule);

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

  const HTTP_PORT = process.env.LMS_HTTP_PORT || 8082;
  await httpApp.listen(HTTP_PORT);
  console.log(`🚀 LMS Service HTTP listening on port ${HTTP_PORT}`);

  // 2. Create NATS microservice (optional, keep for inter-service)
  const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    LmsModule,
    createNatsServiceConfig(),
  );

  await natsApp.listen();
  console.log('📡 LMS Service NATS microservice listening');
}

bootstrap();
