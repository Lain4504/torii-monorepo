import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createTcpServiceConfig } from '@server/shared';

import { AiServiceModule } from './ai-service.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AiServiceModule,
        createTcpServiceConfig({
            hostEnvKey: 'AI_HOST',
            portEnvKey: 'AI_PORT',
            defaultPort: 8086,
        }),
    );

    await app.listen();
}

bootstrap();
