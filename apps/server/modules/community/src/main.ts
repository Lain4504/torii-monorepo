import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { CommunityModule } from './community.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        CommunityModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('Notification Microservice is listening on NATS...');
}

bootstrap();
