import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SenseiAgentService } from './sensei-agent/sensei-agent.service';
import { AssessmentAgentService } from './assessment-agent/assessment-agent.service';
import { AnalyticsAgentService } from './analytics-agent/analytics-agent.service';

@Controller()
export class CortexController {
  private readonly logger = new Logger(CortexController.name);

  constructor(
    private readonly senseiService: SenseiAgentService,
    private readonly assessmentService: AssessmentAgentService,
    private readonly analyticsService: AnalyticsAgentService,
  ) {}

  // Sensei Agent Message Handlers
  @MessagePattern({ cmd: 'ai.grammar.check' })
  async checkGrammar(@Payload() data: { text: string }) {
    try {
      this.logger.log('AI Grammar check request received');
      const result = await this.senseiService.checkGrammar(data.text);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.grammar.check:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.translate' })
  async translate(@Payload() data: { text: string; from: string; to: string }) {
    try {
      this.logger.log('AI Translate request received');
      const result = await this.senseiService.translate(data.text, data.from, data.to);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.translate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.flashcard.create' })
  async createFlashcard(@Payload() data: { word: string; meaning: string; example?: string }) {
    try {
      this.logger.log('AI Flashcard create request received');
      const result = await this.senseiService.createFlashcard(data.word, data.meaning, data.example);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.flashcard.create:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.drill.generate' })
  async generatePracticeDrill(@Payload() data: { drillType: string; level: string; topic?: string }) {
    try {
      this.logger.log('AI Drill generate request received');
      const result = await this.senseiService.generatePracticeDrill(data.drillType, data.level, data.topic);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.drill.generate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.conversation.simulate' })
  async simulateConversation(@Payload() data: { topic: string; level: string }) {
    try {
      this.logger.log('AI Conversation simulate request received');
      const result = await this.senseiService.simulateConversation(data.topic, data.level);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.conversation.simulate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.resources.recommend' })
  async recommendResources(@Payload() data: { concept: string; level: string }) {
    try {
      this.logger.log('AI Resources recommend request received');
      const result = await this.senseiService.recommendResources(data.concept, data.level);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.resources.recommend:', error);
      throw error;
    }
  }

  // Assessment Agent Message Handlers
  @MessagePattern({ cmd: 'ai.test.generate' })
  async generateJLPTTest(@Payload() data: { level: string; type: string; questionCount: number }) {
    try {
      this.logger.log('AI Test generate request received');
      const result = await this.assessmentService.generateJlptTest(data.level, data.type, data.questionCount);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.test.generate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.test.evaluate' })
  async evaluateTest(@Payload() data: { testId: string; answers: any }) {
    try {
      this.logger.log('AI Test evaluate request received');
      const result = await this.assessmentService.evaluateTest(data.testId, data.answers);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.test.evaluate:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.benchmark.get' })
  async getProgressBenchmark(@Payload() data: { userId: string; level: string }) {
    try {
      this.logger.log('AI Benchmark get request received');
      const result = await this.assessmentService.getProgressBenchmark(data.userId, data.level);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.benchmark.get:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.test.schedule' })
  async scheduleTest(@Payload() data: { userId: string; level: string; date: string }) {
    try {
      this.logger.log('AI Test schedule request received');
      const result = await this.assessmentService.scheduleTest(data.userId, data.level, data.date);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.test.schedule:', error);
      throw error;
    }
  }

  // Analytics Agent Message Handlers
  @MessagePattern({ cmd: 'ai.progress.track' })
  async trackProgress(@Payload() data: { userId: string; activity: string; score?: number }) {
    try {
      this.logger.log('AI Progress track request received');
      const result = await this.analyticsService.trackProgress(data.userId, data.activity, data.score);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.progress.track:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.path.suggest' })
  async suggestStudyPath(@Payload() data: { userId: string }) {
    try {
      this.logger.log('AI Path suggest request received');
      const result = await this.analyticsService.suggestStudyPath(data.userId);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.path.suggest:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.weaknesses.identify' })
  async identifyWeaknesses(@Payload() data: { userId: string }) {
    try {
      this.logger.log('AI Weaknesses identify request received');
      const result = await this.analyticsService.identifyWeaknesses(data.userId);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.weaknesses.identify:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.readiness.predict' })
  async predictReadiness(@Payload() data: { userId: string; level: string }) {
    try {
      this.logger.log('AI Readiness predict request received');
      const result = await this.analyticsService.predictReadiness(data.userId, data.level);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.readiness.predict:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'ai.report.generate' })
  async generateReport(@Payload() data: { userId: string; reportType: string }) {
    try {
      this.logger.log('AI Report generate request received');
      const result = await this.analyticsService.generateReport(data.userId, data.reportType);
      return result;
    } catch (error: any) {
      this.logger.error('Error in ai.report.generate:', error);
      throw error;
    }
  }
}
