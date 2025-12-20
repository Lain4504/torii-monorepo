import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { CourseServiceModule } from './course-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CourseServiceModule,
    createNatsServiceConfig(),
  );

  await app.listen();
  console.log('Course Microservice is listening on NATS...');
}

bootstrap();
