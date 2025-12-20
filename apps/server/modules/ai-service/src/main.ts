import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { AiServiceModule } from './ai-service.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AiServiceModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('AI Microservice is listening on NATS...');
}

bootstrap();
