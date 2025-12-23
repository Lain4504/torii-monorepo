import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Use default NestJS body parser (matching Go server - no special content-type checks)
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

