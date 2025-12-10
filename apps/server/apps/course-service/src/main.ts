import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { CourseServiceModule } from './course-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CourseServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.COURSE_HOST ?? '0.0.0.0',
        port: Number(process.env.COURSE_PORT ?? 8082),
        retryAttempts: 5,
        retryDelay: 1000,
      },
    },
  );

  await app.listen();
}

bootstrap();

