import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  // Create app with custom body parser
  const app = await NestFactory.create(GatewayModule);

  // Configure body parser to accept webhook content-type
  app.use(bodyParser.json({
    type: ['application/json', 'application/webhook+json']
  }));
  // Accept binary protobuf
  app.use(bodyParser.raw({
    type: ['application/protobuf', 'application/octet-stream'],
    limit: '10mb'
  }));

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

