import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IdentityModule } from './identity.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. Create HTTP application (for client requests)
  const httpApp = await NestFactory.create(IdentityModule);

  // Enable CORS
  httpApp.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Global validation pipe
  httpApp.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Start HTTP server on port 8081
  const HTTP_PORT = process.env.IDENTITY_HTTP_PORT || 8081;
  await httpApp.listen(HTTP_PORT);
  console.log(`🚀 Identity Service HTTP listening on port ${HTTP_PORT}`);

  // 2. Create NATS microservice (for inter-service communication)
  const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URL || 'nats://localhost:4222'],
      },
    },
  );

  await natsApp.listen();
  console.log('📡 Identity Service NATS microservice listening');
}

bootstrap();
