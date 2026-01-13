/**
 * Sensei Agent Service Interface
 * Defines the contract for AI-powered tutoring operations
 */
export interface ISenseiAgentService {
  checkGrammar(text: string): Promise<any>;
  translate(text: string, from: string, to: string): Promise<any>;
  createFlashcard(
    word: string,
    meaning: string,
    example?: string,
  ): Promise<any>;
  generatePracticeDrill(
    drillType: string,
    level: string,
    topic?: string,
  ): Promise<any>;
  simulateConversation(scenario: string, level: string): Promise<any>;
  recommendResources(topic: string, level: string): Promise<any>;
}
