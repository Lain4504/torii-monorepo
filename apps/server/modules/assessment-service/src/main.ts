import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { createNatsServiceConfig } from '@server/shared';
import { AssessmentModule } from './assessment.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    // 1. Create HTTP application
    const httpApp = await NestFactory.create(AssessmentModule);

    // Configure cookie parser - REQUIRED for web auth with httpOnly cookies
    httpApp.use(cookieParser());

    // Enable CORS
    // CORS handled by Gateway
    // httpApp.enableCors({...});

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
