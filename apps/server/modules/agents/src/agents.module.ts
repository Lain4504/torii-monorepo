import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
// import { FastMcpModule } from './fastmcp/fastmcp.module'; // No longer imported directly if handled by sub-modules, or kept as shared
import { SenseiHandler } from './interfaces/nats/sensei.handler';
import { AssessmentHandler } from './interfaces/nats/assessment.handler';
import { AnalyticsHandler } from './interfaces/nats/analytics.handler';
import { SenseiModule } from './modules/sensei/sensei.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FastMcpModule } from './fastmcp/fastmcp.module'; // Keep importing for the MCP controller

/**
 * Agents Module - Main module for AI-powered learning agents
 * 
 * Architecture (following Identity Service pattern on gamification branch):
 * ===========================================================================
 * Gateway → NATS → Agents Service Handlers → Domain Service → FastMCP Service → Gemini
 * 
 * Components:
 * - NATS Handlers: Handle inter-service NATS messages from gateway
 * - Domain Services: Sensei, Assessment, Analytics (Business Logic)
 * - FastMCP Service: The AI brain - handles Gemini interaction
 * 
 * Note: No HTTP controllers in agents service - all requests come through gateway via NATS
 */
@Module({
  imports: [
    SharedModule,
    SenseiModule,
    AssessmentModule,
    AnalyticsModule,
    FastMcpModule, // For the public MCP Controller
  ],
  controllers: [
    SenseiHandler,
    AssessmentHandler,
    AnalyticsHandler,
  ],
  providers: [],
})
export class AgentsModule { }
