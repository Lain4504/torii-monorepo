import 'dotenv/config';
import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@server/shared';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { raw } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
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
    .addTag('question-bank')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.port ?? 8080);
}
bootstrap();

