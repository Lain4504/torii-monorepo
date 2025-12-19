import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createTcpServiceConfig } from '@server/shared';

import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        NotificationServiceModule,
        createTcpServiceConfig({
            hostEnvKey: 'NOTIFICATION_HOST',
            portEnvKey: 'NOTIFICATION_PORT',
            defaultPort: 8087,
        }),
    );

    await app.listen();
}

bootstrap();
