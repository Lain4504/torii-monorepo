import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) {}

  // Sensei Agent Methods
  async checkGrammar(text: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.grammar.check' }, { text })
    );
  }

  async translate(text: string, from: string, to: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.translate' }, { text, from, to })
    );
  }

  async createFlashcard(word: string, meaning: string, example?: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.flashcard.create' }, { word, meaning, example })
    );
  }

  async generatePracticeDrill(drillType: string, level: string, topic?: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.drill.generate' }, { drillType, level, topic })
    );
  }

  async simulateConversation(topic: string, level: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.conversation.simulate' }, { topic, level })
    );
  }

  async recommendResources(concept: string, level: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.resources.recommend' }, { concept, level })
    );
  }

  // Assessment Agent Methods
  async generateJLPTTest(level: string, type: string, questionCount: number): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.test.generate' }, { level, type, questionCount })
    );
  }

  async evaluateTest(testId: string, answers: any): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.test.evaluate' }, { testId, answers })
    );
  }

  async getProgressBenchmark(userId: string, level: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.benchmark.get' }, { userId, level })
    );
  }

  async scheduleTest(userId: string, level: string, date: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.test.schedule' }, { userId, level, date })
    );
  }

  // Analytics Agent Methods
  async trackProgress(userId: string, activity: string, score?: number): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.progress.track' }, { userId, activity, score })
    );
  }

  async suggestStudyPath(userId: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.path.suggest' }, { userId })
    );
  }

  async identifyWeaknesses(userId: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.weaknesses.identify' }, { userId })
    );
  }

  async predictReadiness(userId: string, level: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.readiness.predict' }, { userId, level })
    );
  }

  async generateReport(userId: string, reportType: string): Promise<any> {
    return await lastValueFrom(
      this.natsClient.send({ cmd: 'ai.report.generate' }, { userId, reportType })
    );
  }
}
