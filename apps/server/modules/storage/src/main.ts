import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { StorageModule } from './storage.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 1. Create HTTP application
  const httpApp = await NestFactory.create(StorageModule);

  // Configure cookie parser - REQUIRED for web auth with httpOnly cookies
  httpApp.use(cookieParser());

  // Global validation pipe
  httpApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const HTTP_PORT = process.env.STORAGE_HTTP_PORT || 8086;
  await httpApp.listen(HTTP_PORT);
  logger.log(`🚀 Storage Service HTTP listening on port ${HTTP_PORT}`);

  // 2. Create NATS microservice
  const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    StorageModule,
    createNatsServiceConfig(),
  );

  await natsApp.listen();
  logger.log('📡 Storage Service NATS microservice listening');
}

bootstrap();


