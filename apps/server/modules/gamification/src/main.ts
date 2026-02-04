import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { GamificationModule } from './gamification.module';
import { createNatsServiceConfig } from '@server/shared';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        GamificationModule,
        createNatsServiceConfig('torii_queue'),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen();
    console.log('🎮 Gamification Service is running');
    console.log('📦 Queue:', 'torii_queue');
}
bootstrap();
