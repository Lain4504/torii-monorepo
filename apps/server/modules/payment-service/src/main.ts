import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createTcpServiceConfig } from '@server/shared';

import { PaymentServiceModule } from './payment-service.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        PaymentServiceModule,
        createTcpServiceConfig({
            hostEnvKey: 'PAYMENT_HOST',
            portEnvKey: 'PAYMENT_PORT',
            defaultPort: 8085,
        }),
    );

    await app.listen();
}

bootstrap();
