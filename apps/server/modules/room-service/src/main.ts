import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { RoomServiceModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(RoomServiceModule);

  // Enable raw body parsing for Protobuf
  app.use(bodyParser.raw({ type: 'application/protobuf', limit: '5mb' }));
  app.use(bodyParser.json());

  // Optional: Connect Redis microservice if still needed during migration
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });

  await app.startAllMicroservices();
  await app.listen(8083); // Room Service port
  console.log(`Room Service is running on: ${await app.getUrl()}`);
}
bootstrap();
