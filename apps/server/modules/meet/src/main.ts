import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { MeetModule } from './meet.module';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // 1. Create HTTP application
  const httpApp = await NestFactory.create(MeetModule);

  // Configure cookie parser - REQUIRED for web auth with httpOnly cookies
  httpApp.use(cookieParser());

  // Enable CORS
  // CORS handled by Gateway
  // httpApp.enableCors({...});

  // Configure body parser to match old Gateway architecture
  // JSON parser for application/json requests
  httpApp.use(bodyParser.json({
    type: ['application/json', 'application/webhook+json']
  }));

  // Raw binary parser for protobuf requests
  httpApp.use(bodyParser.raw({
    type: ['application/protobuf', 'application/octet-stream'],
    limit: '10mb'
  }));

  // Global validation pipe
  httpApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const HTTP_PORT = process.env.MEET_HTTP_PORT || 8091;
  await httpApp.listen(HTTP_PORT, '0.0.0.0');
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
