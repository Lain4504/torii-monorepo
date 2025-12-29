import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { GamificationModule } from './gamification.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        GamificationModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('Gamification Microservice is listening on NATS...');
}

bootstrap();
