import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createTcpServiceConfig } from '@server/shared';

import { AssessmentServiceModule } from './assessment-service.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AssessmentServiceModule,
        createTcpServiceConfig({
            hostEnvKey: 'ASSESSMENT_HOST',
            portEnvKey: 'ASSESSMENT_PORT',
            defaultPort: 8084,
        }),
    );

    await app.listen();
}

bootstrap();
