import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { BillingModule } from './billing.module';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
    // 1. Create HTTP application
    const httpApp = await NestFactory.create(BillingModule);

    // Configure body parser
    httpApp.use(bodyParser.json({ limit: '10mb' }));
    httpApp.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

    // Configure cookie parser
    httpApp.use(cookieParser());

    // Global validation pipe
    httpApp.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }),
    );

    const HTTP_PORT = process.env.BILLING_HTTP_PORT || 8085;
    await httpApp.listen(HTTP_PORT);
    console.log(`🚀 Billing Service HTTP listening on port ${HTTP_PORT}`);

    // 2. Create NATS microservice
    const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
        BillingModule,
        createNatsServiceConfig(),
    );

    await natsApp.listen();
    console.log('📡 Billing Service NATS microservice listening');
}

bootstrap();
