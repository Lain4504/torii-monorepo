import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SenseiAgentModule } from './sensei-agent/sensei-agent.module';
import { AssessmentAgentModule } from './assessment-agent/assessment-agent.module';
import { AnalyticsAgentModule } from './analytics-agent/analytics-agent.module';
import { SharedModule } from './shared/shared.module';
import { FastMcpModule } from './fastmcp/fastmcp.module';
import { SenseiController } from './interfaces/http/sensei.controller';
import { AssessmentController } from './interfaces/http/assessment.controller';
import { AnalyticsController } from './interfaces/http/analytics.controller';
import { SenseiAgentController } from './interfaces/nats/sensei-agent.controller';
import { AssessmentAgentController } from './interfaces/nats/assessment-agent.controller';
import { AnalyticsAgentController } from './interfaces/nats/analytics-agent.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    SenseiAgentModule,
    AssessmentAgentModule,
    AnalyticsAgentModule,
    FastMcpModule,
  ],
  controllers: [SenseiController, AssessmentController, AnalyticsController, SenseiAgentController, AssessmentAgentController, AnalyticsAgentController],
  providers: [],
})
export class AgentsModule { }
