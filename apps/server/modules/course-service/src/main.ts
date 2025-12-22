import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { CourseServiceModule } from './course-service.module';
import { ExceptionFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CourseServiceModule,
    createNatsServiceConfig(),
  );

  // Add exception filter to convert HttpException to RpcException
  app.useGlobalFilters(new ExceptionFilter());

  // Add validation pipe for microservice
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen();
  console.log('Course Microservice is listening on NATS...');
}

bootstrap();
