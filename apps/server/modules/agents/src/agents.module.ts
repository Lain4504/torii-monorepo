import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
// import { FastMcpModule } from './fastmcp/fastmcp.module'; // No longer imported directly if handled by sub-modules, or kept as shared
import { SenseiHandler, AssessmentHandler, AnalyticsHandler } from '@server/agents/interfaces/nats';
import { SenseiModule, AssessmentModule, AnalyticsModule } from '@server/agents/modules';
import { FastMcpModule } from '@server/agents/fastmcp/fastmcp.module'; // Keep importing for the MCP controller


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
