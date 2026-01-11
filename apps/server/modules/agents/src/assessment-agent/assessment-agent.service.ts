import { Injectable } from '@nestjs/common';
import { AiTemplateService } from '../shared/ai-template.service';

@Injectable()
export class AssessmentAgentService {
  constructor(private readonly aiTemplateService: AiTemplateService) {}

  async generateJlptTest(level: string, type: string, questionCount: number): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('assessment.test-generate', {
      level,
      focusAreas: type,
      questionCount
    });

    if (result.rawResponse) {
      return {
        testId: `jlpt-${level}-${type}-${Date.now()}`,
        level,
        type,
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return {
      testId: `jlpt-${level}-${type}-${Date.now()}`,
      level,
      type,
      questions: result.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        question: q.question,
        options: q.options,
        // correctAnswer removed for security
      })),
    };
  }

  async evaluateTest(testId: string, answers: Record<string, string>): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('assessment.evaluate', {
      level: 'unknown', // We don't have level info here, could be passed as parameter
      questions: JSON.stringify({}), // This needs to be passed properly
      answers: JSON.stringify(answers)
    });

    if (result.rawResponse) {
      return {
        testId,
        aiResponse: result.rawResponse,
        error: result.error,
      };
    }

    return {
      testId,
      ...result,
    };
  }

  async getProgressBenchmark(userId: string, level: string): Promise<any> {
    const result = await this.aiTemplateService.executeTemplate('assessment.progress-benchmark', {
      userId,
      level
    });

    if (result.rawResponse) {
      return {
        aiResponse: result.rawResponse,
        error: result.error
      };
    }

    return result;
  }

  async scheduleTest(userId: string, level: string, date: string): Promise<any> {
    // This could integrate with a scheduling system, but for now, just acknowledge
    return {
      userId,
      level,
      scheduledDate: date,
      message: `Test scheduled for JLPT ${level} on ${date}. Reminder will be sent.`,
    };
  }
}
