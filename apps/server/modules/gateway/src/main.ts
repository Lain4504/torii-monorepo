import 'dotenv/config';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import * as bodyParser from 'body-parser';
const cookieParser = require('cookie-parser');

async function bootstrap() {
  // Create app with custom body parser
  const app = await NestFactory.create(GatewayModule);

  // Cookie parser middleware - for HttpOnly cookie support
  app.use(cookieParser());

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

  await app.listen(process.env.port ?? 8080);
}
bootstrap();

