import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { PaymentServiceModule } from './payment-service.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        PaymentServiceModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('Payment Microservice is listening on NATS...');
}

bootstrap();
