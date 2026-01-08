import { Injectable } from '@nestjs/common';
import { AiService } from '../shared/ai.service';

@Injectable()
export class SenseiAgentService {
  constructor(private readonly aiService: AiService) {}

  async checkGrammar(text: string): Promise<string> {
    const prompt = `Analyze the following Japanese text for grammar correctness: "${text}".
Provide detailed feedback on:
1. Grammar errors and corrections
2. Suggestions for improvement
3. Overall assessment (correct, minor issues, needs work)
Be specific and helpful for language learners.`;

    return await this.aiService.callGemini(prompt);
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const prompt = `Translate the following text from ${from} to ${to}: "${text}".
Provide a natural, accurate translation. If translating to Japanese, include furigana for kanji.`;

    return await this.aiService.callGemini(prompt);
  }

  async createFlashcard(word: string, meaning: string, example?: string): Promise<any> {
    const prompt = `Create a comprehensive flashcard for the Japanese word "${word}" with English meaning "${meaning}".
${example ? `Include this example sentence: "${example}"` : 'Create a relevant example sentence.'}
Format as JSON with: {"word": "...", "reading": "...", "meaning": "...", "partOfSpeech": "...", "example": "...", "exampleTranslation": "...", "jlptLevel": "..."}`;

    const response = await this.aiService.callGemini(prompt);
    
    // Strip markdown code blocks if present
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    try {
      const parsed = JSON.parse(cleanResponse);
      return {
        ...parsed,
        created: new Date(),
      };
    } catch (error) {
      // Return raw AI response instead of mock data
      return {
        word,
        meaning,
        example,
        created: new Date(),
        aiResponse: cleanResponse,
        error: 'Failed to parse AI response as JSON, returning raw text',
      };
    }
  }

  async generatePracticeDrill(drillType: string, level: string, topic?: string): Promise<any> {
    const prompt = `Generate a ${drillType} practice drill for JLPT ${level} level${topic ? ` on the topic: ${topic}` : ''}.
Provide 5-10 exercises with answers and explanations.
For fill-in-the-gaps: provide sentence with blank, options, correct answer.
For sentence building: provide words, ask to build sentence.
For multiple-choice: provide question and options.
Format as JSON: {"drillType": "...", "level": "...", "exercises": [{"question": "...", "options": [...], "correctAnswer": "...", "explanation": "..."}]}`;

    const response = await this.aiService.callGemini(prompt);
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      return { aiResponse: cleanResponse, error: 'Failed to parse' };
    }
  }

  async simulateConversation(topic: string, level: string): Promise<any> {
    const prompt = `Simulate a basic Japanese conversation for JLPT ${level} level on the topic: ${topic}.
Provide a dialogue with 4-6 exchanges, including English translations.
Format as JSON: {"topic": "...", "level": "...", "dialogue": [{"speaker": "A", "japanese": "...", "english": "..."}]}`;

    const response = await this.aiService.callGemini(prompt);
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      return { aiResponse: cleanResponse, error: 'Failed to parse' };
    }
  }

  async recommendResources(concept: string, level: string): Promise<any> {
    const prompt = `Recommend supplementary materials for learning the Japanese concept: ${concept} at JLPT ${level} level.
Suggest videos, articles, exercises from JLPT-aligned resources.
Format as JSON: {"concept": "...", "level": "...", "recommendations": [{"type": "video/article/exercise", "title": "...", "description": "...", "url": "..."}]}`;

    const response = await this.aiService.callGemini(prompt);
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    try {
      return JSON.parse(cleanResponse);
    } catch (error) {
      return { aiResponse: cleanResponse, error: 'Failed to parse' };
    }
  }
}
