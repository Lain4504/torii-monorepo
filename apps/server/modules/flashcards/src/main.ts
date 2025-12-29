import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { FlashcardsModule } from './flashcards.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        FlashcardsModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('Flashcards Microservice is listening on NATS...');
}

bootstrap();
