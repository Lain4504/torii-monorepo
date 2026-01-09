import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SenseiAgentModule } from './sensei-agent/sensei-agent.module';
import { AssessmentAgentModule } from './assessment-agent/assessment-agent.module';
import { AnalyticsAgentModule } from './analytics-agent/analytics-agent.module';
import { SharedModule } from './shared/shared.module';
import { FastMcpModule } from './fastmcp/fastmcp.module';
import { SenseiController } from './controllers/sensei.controller';
import { AssessmentController } from './controllers/assessment.controller';
import { AnalyticsController } from './controllers/analytics.controller';

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
  controllers: [SenseiController, AssessmentController, AnalyticsController],
  providers: [],
})
export class AgentsModule { }
