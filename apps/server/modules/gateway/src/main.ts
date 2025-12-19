import 'dotenv/config';
import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { GatewayModule } from './gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@server/shared';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { raw } from 'body-parser';

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

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Exclude 'webhook' from global prefix so it remains at /webhook root if needed,
  // or at least available for standard external calls without /api if configured that way.
  // We exclude both POST /webhook and POST /webhook/*
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'webhook', method: RequestMethod.POST },
      { path: 'webhook/(.*)', method: RequestMethod.POST },
    ],
  });

  // Enable raw body parsing for protobuf
  app.use(raw({ type: 'application/protobuf', limit: '10mb' }));

  // 1. Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      transform: true, // Auto transform payload to DTO instance
    }),
  );

  // 2. Global Interceptor (Success Response)


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

