import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { LearningModule } from './learning.module';

async function bootstrap() {
  console.log('🚀 Learning Service starting...');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    LearningModule,
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
  console.log('📡 LMS Service NATS microservice listening');
}

bootstrap();
