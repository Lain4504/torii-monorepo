import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FastMcpModule } from './fastmcp/fastmcp.module';
import { SenseiHandler } from './interfaces/nats/sensei.handler';
import { AssessmentHandler } from './interfaces/nats/assessment.handler';
import { AnalyticsHandler } from './interfaces/nats/analytics.handler';

/**
 * Agents Module - Main module for AI-powered learning agents
 * 
 * Architecture (following Identity Service pattern on gamification branch):
 * ===========================================================================
 * Gateway → NATS → Agents Service Handlers → FastMCP Service → Gemini
 * 
 * Components:
 * - NATS Handlers: Handle inter-service NATS messages from gateway
 * - FastMCP Service: The AI brain - handles all Gemini calls and prompt engineering
 * - Gemini API: The LLM (only called from FastMCP)
 * 
 * Note: No HTTP controllers in agents service - all requests come through gateway via NATS
 */
@Module({
  imports: [
    SharedModule,
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
