import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { BillingModule } from './billing.module';

async function bootstrap() {
    console.log('🚀 Billing Service starting...');

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        BillingModule,
        createNatsServiceConfig(),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }),
    );

    await app.listen();
    console.log('📡 Billing Service NATS microservice listening');
}

bootstrap();
