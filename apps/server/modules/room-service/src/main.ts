import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { RoomServiceModule } from './app.module';

async function bootstrap() {
  console.log('🚀 Starting Room Microservice...');

  const natsConfig = createNatsServiceConfig();
  console.log('📡 NATS Config created');

  // Pure NATS Microservice - No HTTP server needed!
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RoomServiceModule,
    natsConfig,
  );

  await app.listen();
  console.log('✅ Room Microservice is listening on NATS...');
  console.log('📝 Registered message patterns should appear above');
}

bootstrap();
