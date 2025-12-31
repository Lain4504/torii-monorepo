import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Helper function for AI calls with error handling
async function callGemini(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return `Error: Unable to process request. ${error.message}`;
  }
}

@Injectable()
export class SenseiAgentService {
  async checkGrammar(text: string): Promise<string> {
    const prompt = `Analyze the following Japanese text for grammar correctness: "${text}".
Provide detailed feedback on:
1. Grammar errors and corrections
2. Suggestions for improvement
3. Overall assessment (correct, minor issues, needs work)
Be specific and helpful for language learners.`;

    return await callGemini(prompt);
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const prompt = `Translate the following text from ${from} to ${to}: "${text}".
Provide a natural, accurate translation. If translating to Japanese, include furigana for kanji.`;

    return await callGemini(prompt);
  }

  async createFlashcard(word: string, meaning: string, example?: string): Promise<any> {
    const prompt = `Create a comprehensive flashcard for the Japanese word "${word}" with English meaning "${meaning}".
${example ? `Include this example sentence: "${example}"` : 'Create a relevant example sentence.'}
Format as JSON with: {"word": "...", "reading": "...", "meaning": "...", "partOfSpeech": "...", "example": "...", "exampleTranslation": "...", "jlptLevel": "..."}`;

    const response = await callGemini(prompt);
    
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
}
