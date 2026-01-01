import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { MeetModule } from './meet.module';

async function bootstrap() {
  // 1. Create HTTP application
  const httpApp = await NestFactory.create(MeetModule);

  // Enable CORS
  httpApp.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  httpApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const HTTP_PORT = process.env.MEET_HTTP_PORT || 8091;
  await httpApp.listen(HTTP_PORT);
  console.log(`🚀 Meet Service HTTP listening on port ${HTTP_PORT}`);

  // 2. Create NATS microservice for realtime features
  const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    MeetModule,
    createNatsServiceConfig(),
  );

  await natsApp.listen();
  console.log('📡 Meet Service NATS microservice listening (for realtime features)');
}

bootstrap();
