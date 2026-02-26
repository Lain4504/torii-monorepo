import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { SenseiHandler } from './handlers/sensei.handler';
import { AssessmentHandler } from './handlers/assessment.handler';
import { AnalyticsHandler } from './handlers/analytics.handler';
import { SenseiModule, AssessmentModule, AnalyticsModule } from '@server/agents/modules';
import { LivekitAgentService } from './modules/livekit/livekit-agent.service';


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
  ],
  controllers: [
    SenseiHandler,
    AssessmentHandler,
    AnalyticsHandler,
  ],
  providers: [
    LivekitAgentService
  ],
})
export class AgentsModule { }
