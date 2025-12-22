import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { BlogServiceModule } from './blog-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BlogServiceModule,
    createNatsServiceConfig(),
  );

  await app.listen();
  console.log('Blog Microservice is listening on NATS...');
}

bootstrap();



