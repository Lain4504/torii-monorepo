import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { SenseiModule, AssessmentModule, AnalyticsModule } from '@server/agents/modules';

/**
 * Agents Module - Main module for AI-powered learning agents
 *
 * Architecture:
 * Gateway → NATS → Feature Handlers → Domain Services → FastMCP → Gemini
 */
@Module({
  imports: [
    SharedModule,
    SenseiModule,
    AssessmentModule,
    AnalyticsModule,
  ],
})
export class AgentsModule { }
