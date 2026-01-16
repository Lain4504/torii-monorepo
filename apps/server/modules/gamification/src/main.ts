import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { GamificationModule } from './gamification.module';
import { nkeyAuthenticator } from 'nats';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        GamificationModule,
        {
            transport: Transport.NATS,
            options: {
                servers: [process.env.NATS_URL || 'nats://localhost:4222'],
                queue: 'torii_queue',
                authenticator: process.env.NATS_NKEY_SEED
                    ? nkeyAuthenticator(new TextEncoder().encode(process.env.NATS_NKEY_SEED))
                    : undefined,
            },
        },
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
    console.log('📡 NATS URL:', process.env.NATS_URL || 'nats://localhost:4222');
    console.log('📦 Queue:', 'torii_queue');
}
bootstrap();
