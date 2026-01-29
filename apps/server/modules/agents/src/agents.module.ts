import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { createNatsServiceConfig } from '@server/shared';
import { FastMcpModule } from './fastmcp/fastmcp.module';
import { SenseiHandler } from './interfaces/nats/sensei.handler';
import { AssessmentHandler } from './interfaces/nats/assessment.handler';
import { AnalyticsHandler } from './interfaces/nats/analytics.handler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'LEARNING_SERVICE',
        transport: Transport.NATS,
        options: createNatsServiceConfig().options as any,
      },
    ]),
    FastMcpModule,
  ],
  controllers: [
    SenseiHandler,
    AssessmentHandler,
    AnalyticsHandler,
  ],
  providers: [],
})
export class AgentsModule { }
