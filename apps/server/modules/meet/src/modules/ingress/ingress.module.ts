/**
 * Ingress Module
 */

import { Module, forwardRef } from '@nestjs/common';
import { IngressService } from './ingress.service';
import { LiveKitModule } from '../../infrastructure/livekit/livekit.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { NatsModule } from '../../interfaces/nats/nats.module';

@Module({
    imports: [
        LiveKitModule,
        forwardRef(() => AnalyticsModule),
        NatsModule,
    ],
    providers: [IngressService],
    exports: [IngressService],
})
export class IngressModule { }
