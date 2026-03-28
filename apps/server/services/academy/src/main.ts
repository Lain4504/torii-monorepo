import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { AcademyModule } from '@server/academy/academy.module';

async function bootstrap() {
  // NATS-only microservice (no HTTP server)
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AcademyModule,
    createNatsServiceConfig('academy_queue'),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen();
  console.log('📡 Academy Service NATS microservice listening');
}

bootstrap();
