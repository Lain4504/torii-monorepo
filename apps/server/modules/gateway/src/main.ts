import 'dotenv/config';
import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@server/shared';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { raw, json, urlencoded } from 'body-parser';

async function bootstrap() {
  // Disable Nest's default body parser so we can control raw protobuf handling for polls
  const app = await NestFactory.create(GatewayModule, { bodyParser: false });
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

  // Ensure poll endpoints can read protobuf payloads even if the client misses Content-Type
  // Use a narrow path scope so the rest of the app still benefits from JSON parsing
  // Polls: always capture raw body; controller will decode protobuf or JSON
  app.use('/api/polls', raw({ type: '*/*', limit: '10mb' }));
  // Fallback collector in case body-parser raw is skipped (e.g., missing content-type)
  app.use('/api/polls', (req, _res, next) => {
    if (req.body) return next();
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      (req as any).body = Buffer.concat(chunks);
      next();
    });
  });
  // Standard parsers for the rest of the app
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // 1. Validation Pipe
  // Skip validation for multipart/form-data (file uploads)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      transform: true, // Auto transform payload to DTO instance
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
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

