import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FastMcpService } from '../../fastmcp/fastmcp.service';

/**
 * NATS Handler for Sensei Agent
 * Handles inter-service communication via NATS messaging
 */
@Controller()
export class SenseiHandler {
  constructor(private readonly fastMcpService: FastMcpService) { }

  @MessagePattern({ cmd: 'agents.sensei.grammarCheck' })
  async checkGrammar(@Payload() data: { text: string; userId: string }) {
    return this.fastMcpService.checkGrammar(data.userId, data.text);
  }

  @MessagePattern({ cmd: 'agents.sensei.translate' })
  async translate(
    @Payload()
    data: { text: string; from: string; to: string; userId: string },
  ) {
    return this.fastMcpService.translate(data.userId, data.text, data.from, data.to);
  }

  @MessagePattern({ cmd: 'agents.sensei.createFlashcard' })
  async createFlashcard(
    @Payload()
    data: { topic: string; difficulty?: 'beginner' | 'intermediate' | 'advanced'; userId: string },
  ) {
    return this.fastMcpService.createFlashcard(
      data.userId,
      data.topic,
      data.difficulty || 'intermediate',
    );
  }

  @MessagePattern({ cmd: 'agents.sensei.generateDrill' })
  async generateDrill(
    @Payload()
    data: {
      drillType: 'grammar' | 'vocabulary' | 'kanji' | 'listening' | 'reading';
      topic: string;
      level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
      count?: number;
      userId: string;
    },
  ) {
    return this.fastMcpService.generatePracticeDrill(
      data.userId,
      data.drillType,
      data.topic,
      data.level || 'N4',
      data.count || 5,
    );
  }

  @MessagePattern({ cmd: 'agents.sensei.simulateConversation' })
  async simulateConversation(
    @Payload()
    data: {
      scenario: 'restaurant' | 'shopping' | 'station' | 'office' | 'casual' | 'formal';
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      turns?: number;
      userId: string;
    },
  ) {
    return this.fastMcpService.simulateConversation(
      data.userId,
      data.scenario,
      data.difficulty || 'intermediate',
      data.turns || 4,
    );
  }

  @MessagePattern({ cmd: 'agents.sensei.recommendResources' })
  async recommendResources(
    @Payload()
    data: {
      topic: string;
      resourceType?: 'article' | 'video' | 'book' | 'app' | 'website' | 'all';
      userId: string;
    },
  ) {
    return this.fastMcpService.recommendResources(
      data.userId,
      data.topic,
      data.resourceType || 'all',
    );
  }

  @MessagePattern({ cmd: 'agents.sensei.chat' })
  async chat(
    @Payload()
    data: {
      message: string;
      history: any[];
      userId: string;
    },
  ) {
    return this.fastMcpService.chat(
      data.userId,
      data.message,
      data.history || [],
    );
  }
}
