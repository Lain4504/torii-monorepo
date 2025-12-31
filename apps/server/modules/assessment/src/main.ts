import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { AssessmentModule } from './assessment.module';

async function bootstrap() {
    // 1. Create HTTP application
    const httpApp = await NestFactory.create(AssessmentModule);

    // Enable CORS
    httpApp.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    });

    // Global validation pipe
    httpApp.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }),
    );

    const HTTP_PORT = process.env.ASSESSMENT_HTTP_PORT || 8085;
    await httpApp.listen(HTTP_PORT);
    console.log(`🚀 Assessment Service HTTP listening on port ${HTTP_PORT}`);

    // 2. Create NATS microservice
    const natsApp = await NestFactory.createMicroservice<MicroserviceOptions>(
        AssessmentModule,
        createNatsServiceConfig(),
    );

    await natsApp.listen();
    console.log('📡 Assessment Service NATS microservice listening');
}

bootstrap();
