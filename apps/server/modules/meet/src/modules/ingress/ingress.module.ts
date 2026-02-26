/**
 * Ingress Module
 */

import { Module, forwardRef } from '@nestjs/common';
import { IngressService } from './ingress.service';
import { LiveKitModule } from '@server/meet/infrastructure/livekit/livekit.module';
import { AnalyticsModule } from '@server/meet/modules/analytics/analytics.module';
import { NatsModule } from '@server/meet/handlers/nats.module';

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
