/**
 * Sensei Agent Service Interface
 * Defines the contract for AI-powered tutoring operations
 */
export interface ISenseiAgentService {
  checkGrammar(text: string, userId: string): Promise<any>;
  translate(text: string, from: string, to: string, userId: string): Promise<any>;
  createFlashcard(
    word: string,
    meaning: string,
    example: string | undefined,
    userId: string,
  ): Promise<any>;
  generatePracticeDrill(
    drillType: string,
    level: string,
    topic: string | undefined,
    userId: string,
  ): Promise<any>;
  simulateConversation(scenario: string, level: string, userId: string): Promise<any>;
  recommendResources(topic: string, level: string, userId: string): Promise<any>;
}
