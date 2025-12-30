import { Module } from '@nestjs/common';
import { FlashcardModule } from './flashcard/flashcard.module';
import { FlashcardDeckModule } from './flashcard-deck/flashcard-deck.module';
import { FastMcpModule } from './fastmcp/fastmcp.module';
import { SenseiAgentModule } from './sensei-agent/sensei-agent.module';
import { AssessmentAgentModule } from './assessment-agent/assessment-agent.module';
import { AnalyticsAgentModule } from './analytics-agent/analytics-agent.module';
import { AiController } from './ai.controller';

@Module({
    imports: [
        FlashcardModule,
        FlashcardDeckModule,
        FastMcpModule,
        SenseiAgentModule,
        AssessmentAgentModule,
        AnalyticsAgentModule,
    ],
    controllers: [AiController],
    providers: [],
})
export class AiServiceModule { }
