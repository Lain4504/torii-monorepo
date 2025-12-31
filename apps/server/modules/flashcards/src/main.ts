import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { FlashcardsModule } from './flashcards.module';

async function bootstrap() {
    // 1. Create HTTP application
    const httpApp = await NestFactory.create(FlashcardsModule);

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

    const HTTP_PORT = process.env.FLASHCARDS_HTTP_PORT || 8083;
    await httpApp.listen(HTTP_PORT);
    console.log(`🚀 Flashcards Service HTTP listening on port ${HTTP_PORT}`);

    // 2. Create NATS microservice
    const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
        FlashcardsModule,
        createNatsServiceConfig(),
    );

    await natsApp.listen();
    console.log('📡 Flashcards Service NATS microservice listening');
}

bootstrap();
