/**
 * Insights Module
 */

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InsightsService } from './insights.service';
import { RedisInsightsService } from '../../infrastructure/redis/redis-insights.service';
import { NatsModule } from '../../interfaces/nats/nats.module';
import { ArtifactsModule } from '../artifacts/artifacts.module';

@Module({
    imports: [
        ConfigModule,
        NatsModule,
        ArtifactsModule,
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.NATS,
                    options: {
                        servers: [configService.get<string>('NATS_URL') || 'nats://localhost:4222'],
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    providers: [InsightsService, RedisInsightsService],
    exports: [InsightsService, RedisInsightsService],
})
export class InsightsModule { }
