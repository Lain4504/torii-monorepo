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
}
