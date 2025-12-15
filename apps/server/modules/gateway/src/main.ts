import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GatewayModule } from './gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor, AllExceptionsFilter } from '@server/shared';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  // Redis Microservice Setup
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });
  await app.startAllMicroservices();
  const httpAdapter = app.get(HttpAdapterHost);

  app.enableCors();
  app.setGlobalPrefix('api');

  // 1. Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      transform: true, // Auto transform payload to DTO instance
    }),
  );

  // 2. Global Interceptor (Success Response)
  app.useGlobalInterceptors(new TransformInterceptor());

  // 3. Global Filter (Error Response)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const config = new DocumentBuilder()
    .setTitle('Ky9 Gateway API')
    .setDescription('The Gateway API description')
    .setVersion('1.0')
    .addTag('courses')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.port ?? 8080);
}
bootstrap();
