/**
 * Assessment Agent Service Interface
 * Defines the contract for AI-powered assessment operations
 */
export interface IAssessmentAgentService {
  generateJlptTest(
    level: string,
    type: string,
    questionCount: number,
    userId: string,
  ): Promise<any>;
  evaluateTest(testId: string, answers: any, userId: string): Promise<any>;
  getProgressBenchmark(userId: string, level: string): Promise<any>;
  scheduleTest(userId: string, level: string, date: string): Promise<any>;
}
