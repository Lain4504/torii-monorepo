import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { CommunityModule } from './community.module';

async function bootstrap() {
    // 1. Create HTTP application
    const httpApp = await NestFactory.create(CommunityModule);

    // Enable CORS
    httpApp.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    });

    // Global validation pipe
    httpApp.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }),
    );

    const HTTP_PORT = process.env.COMMUNITY_HTTP_PORT || 8084;
    await httpApp.listen(HTTP_PORT);
    console.log(`🚀 Community Service HTTP listening on port ${HTTP_PORT}`);

    // 2. Create NATS microservice
    const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
        CommunityModule,
        createNatsServiceConfig(),
    );

    await natsApp.listen();
    console.log('📡 Community Service NATS microservice listening');
}

bootstrap();
