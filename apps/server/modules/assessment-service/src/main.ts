import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { AssessmentServiceModule } from './assessment-service.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AssessmentServiceModule,
        createNatsServiceConfig(),
    );

    await app.listen();
    console.log('Assessment Microservice is listening on NATS...');
}

bootstrap();
