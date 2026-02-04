/**
 * Insights Module
 */

import { Module, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InsightsService } from './insights.service';
import { RedisInsightsService } from '../../infrastructure/redis/redis-insights.service';
import { NatsModule } from '../../interfaces/nats/nats.module';
import { ArtifactsModule } from '../artifacts/artifacts.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AppConfigService } from '@server/shared';

@Module({
    imports: [
        NatsModule,
        forwardRef(() => ArtifactsModule),
        forwardRef(() => AnalyticsModule),
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                imports: [],
                useFactory: (appConfig: AppConfigService) => ({
                    transport: Transport.NATS,
                    options: {
                        servers: [appConfig.nats.url],
                    },
                }),
                inject: [AppConfigService],
            },
        ]),
    ],
    providers: [InsightsService, RedisInsightsService],
    exports: [InsightsService, RedisInsightsService],
})
export class InsightsModule { }
