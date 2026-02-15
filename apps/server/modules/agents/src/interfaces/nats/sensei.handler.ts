import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SenseiService } from '@server/agents/modules';
import { TTSService } from '@server/agents/modules/sensei/tts.service';


/**
 * NATS Handler for Sensei Agent
 * Handles inter-service communication via NATS messaging
 */
@Controller()
export class SenseiHandler {
  constructor(
    private readonly senseiService: SenseiService,
    private readonly ttsService: TTSService,
  ) { }

  @MessagePattern({ cmd: 'agents.sensei.grammarCheck' })
  async checkGrammar(@Payload() data: { text: string; userId: string }) {
    return this.senseiService.checkGrammar(data.userId, data.text);
  }

  @MessagePattern({ cmd: 'agents.sensei.translate' })
  async translate(
    @Payload()
    data: { text: string; from: string; to: string; userId: string },
  ) {
    return this.senseiService.translate(data.userId, data.text, data.from, data.to);
  }

  @MessagePattern({ cmd: 'agents.sensei.createFlashcard' })
  async createFlashcard(
    @Payload()
    data: { topic: string; difficulty?: 'beginner' | 'intermediate' | 'advanced'; userId: string },
  ) {
    return this.senseiService.createFlashcard(
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
    return this.senseiService.generatePracticeDrill(
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
    return this.senseiService.simulateConversation(
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
    return this.senseiService.recommendResources(
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
    return this.senseiService.chat(
      data.userId,
      data.message,
      data.history || [],
    );
  }

  @MessagePattern({ cmd: 'agents.sensei.roleplay' })
  async roleplay(
    @Payload()
    data: {
      userId: string;
      topic: string;
      message: string;
      history: any[];
      isFinal?: boolean;
    },
  ) {
    return this.senseiService.roleplay(
      data.userId,
      data.topic,
      data.message,
      data.history || [],
      data.isFinal || false,
    );
  }

  @MessagePattern({ cmd: 'agents.sensei.tts' })
  async tts(@Payload() data: { text: string; voice?: string }) {
    console.log(`[SenseiHandler] Received TTS request for: ${data.text.substring(0, 20)}... (Voice: ${data.voice || 'Default'})`);
    try {
      // google-tts-api might throw if text is too long (200 chars).
      // For roleplay responses, they can be long.
      // We should handle that, but for now let's just try getAudioBase64.
      const url = await this.ttsService.getAudioBase64(data.text, data.voice);
      console.log(`[SenseiHandler] Generated audio base64 (length: ${url.length})`);
      return { url };
    } catch (e) {
      console.error(`[SenseiHandler] TTS failed:`, e);
      throw e;
    }
  }
}
