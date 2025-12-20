import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { RoomServiceModule } from './app.module';

async function bootstrap() {
  // Pure NATS Microservice - No HTTP server needed!
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RoomServiceModule,
    createNatsServiceConfig(),
  );

  await app.listen();
  console.log('Room Microservice is listening on NATS...');
}

bootstrap();
