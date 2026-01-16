import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FastMcpModule } from './fastmcp/fastmcp.module';
import { SenseiController } from './controllers/sensei.controller';
import { AssessmentController } from './controllers/assessment.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { SenseiNatsController } from './controllers/sensei.nats.controller';
import { AssessmentNatsController } from './controllers/assessment.nats.controller';
import { AnalyticsNatsController } from './controllers/analytics.nats.controller';

/**
 * Agents Module - Main module for AI-powered learning agents
 * 
 * Architecture:
 * ============
 * 1. HTTP Layer: Client → HTTP Controllers → FastMCP Service → Gemini
 * 2. NATS Layer: Other Services → NATS Controllers → FastMCP Service → Gemini
 * 
 * Components:
 * - HTTP Controllers: Handle external HTTP requests (port 8090)
 * - NATS Controllers: Handle inter-service NATS messages
 * - FastMCP Service: The AI brain - handles all Gemini calls and prompt engineering
 * - Gemini API: The LLM (only called from FastMCP)
 * 
 * Old agent services (SenseiAgentService, AssessmentAgentService, AnalyticsAgentService)
 * have been removed. All AI logic is now in FastMcpService.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FastMcpModule,
  ],
  controllers: [
    // HTTP Controllers (REST API)
    SenseiController,
    AssessmentController,
    AnalyticsController,
    // NATS Controllers (Microservice communication)
    SenseiNatsController,
    AssessmentNatsController,
    AnalyticsNatsController,
  ],
  providers: [],
})
export class AgentsModule {}
