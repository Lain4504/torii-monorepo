import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { AnalyticsHandler } from './analytics.handler';

@Module({
    imports: [PrismaModule],
    controllers: [AnalyticsHandler],
})
export class AnalyticsModule { }
