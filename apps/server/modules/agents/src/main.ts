import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { AgentsModule } from '@server/agents/agents.module';


async function bootstrap() {
  console.log('🚀 Agents Service starting...');

  // Create Hybrid Application (HTTP + Microservice)
  const app = await NestFactory.create(AgentsModule);

  // Connect NATS Microservice
  app.connectMicroservice(createNatsServiceConfig());

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Start Microservices
  await app.startAllMicroservices();
  console.log('📡 Agents Service NATS microservice listening');

  // Start HTTP Server
  const port = process.env.AGENTS_SERVICE_PORT || 8090; // Default to 8090 per architecture
  await app.listen(port);
  console.log(`🚀 Agents Service HTTP server listening on port ${port}`);
}

bootstrap();
