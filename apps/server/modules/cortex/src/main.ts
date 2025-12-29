import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { CortexModule } from './cortex.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        CortexModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('Cortex (AI) Microservice is listening on NATS...');
}

bootstrap();
