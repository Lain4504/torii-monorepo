import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        NotificationServiceModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('Notification & Blog Microservice is listening on NATS...');
}

bootstrap();
