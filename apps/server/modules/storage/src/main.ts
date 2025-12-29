import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { StorageModule } from './storage.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StorageModule,
    createNatsServiceConfig(),
  );

  await app.listen();
  logger.log('Storage Microservice is listening on NATS...');
}

bootstrap();


