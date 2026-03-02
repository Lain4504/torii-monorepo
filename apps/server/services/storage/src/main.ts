import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { StorageModule } from '@server/storage/storage.module';

async function bootstrap() {
    console.log('🚀 Storage Service starting...');

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        StorageModule,
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
    console.log('📡 Storage Service NATS microservice listening');
}

bootstrap();
