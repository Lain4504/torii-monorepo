import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { AssessmentModule } from './assessment.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AssessmentModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('Assessment Microservice is listening on NATS...');
}

bootstrap();
