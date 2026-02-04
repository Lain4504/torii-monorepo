import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { MeetModule } from './meet.module';

async function bootstrap() {
  // Create NATS microservice (NATS-only mode - no HTTP server)
  const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    MeetModule,
    createNatsServiceConfig(),
  );

  await natsApp.listen();
  console.log('📡 Meet Service NATS microservice listening');
}

bootstrap();
