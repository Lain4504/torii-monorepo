import 'dotenv/config'; // Load .env first
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createTcpServiceConfig } from '@server/shared';

import { CourseServiceModule } from './course-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CourseServiceModule,
    createTcpServiceConfig({
      hostEnvKey: 'COURSE_HOST',
      portEnvKey: 'COURSE_PORT',
      defaultPort: 8082,
    }),
  );

  await app.listen();
}

bootstrap();
