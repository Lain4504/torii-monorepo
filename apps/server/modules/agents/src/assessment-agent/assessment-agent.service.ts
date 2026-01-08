import { Injectable } from '@nestjs/common';
import { AiService } from '../shared/ai.service';

@Injectable()
export class AssessmentAgentService {
  constructor(private readonly aiService: AiService) {}

  async generateJlptTest(level: string, type: string, questionCount: number): Promise<any> {
    const prompt = `Generate ${questionCount} JLPT ${level} level ${type} questions in valid JSON format. 
For vocabulary: each question should have "question" (the word in Japanese), "options" (array of 4 strings: the correct meaning and 3 distractors), "correctAnswer" (index 0-3 of the correct option).
For grammar: each question should have "question" (sentence with blank like "____ を 食べます"), "options" (array of 4 strings), "correctAnswer" (index).
For reading: provide a short passage, then questions with options.
For listening: describe the audio scenario, then questions.
Return only valid JSON with structure: {"questions": [{"id": "q1", "question": "...", "options": ["A","B","C","D"], "correctAnswer": 0}]}.
Ensure questions are appropriate for JLPT ${level} level.`;

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
        testId: `jlpt-${level}-${type}-${Date.now()}`,
        level,
        type,
        questions: parsed.questions.map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          question: q.question,
          options: q.options,
          // correctAnswer removed for security
        })),
      };
    } catch (error) {
      // Return raw AI response instead of mock data
      return {
        testId: `jlpt-${level}-${type}-${Date.now()}`,
        level,
        type,
        aiResponse: cleanResponse,
        error: 'Failed to parse AI response as JSON, returning raw text',
      };
    }
  }

  async evaluateTest(testId: string, answers: Record<string, string>): Promise<any> {
    const prompt = `Provide feedback on the following test answers for JLPT test ID ${testId}. Answers provided: ${JSON.stringify(answers)}.
Analyze the answers and provide constructive feedback for Japanese language learning.
Return JSON with: {"totalQuestions": number, "feedback": "detailed feedback", "analysis": "performance analysis", "recommendations": "study recommendations"}.`;

    const response = await this.aiService.callGemini(prompt);
    
    try {
      const parsed = JSON.parse(response);
      return {
        testId,
        ...parsed,
      };
    } catch (error) {
      // Return raw AI response instead of mock data
      return {
        testId,
        aiResponse: response,
        error: 'Failed to parse AI response as JSON, returning raw text',
      };
    }
  }

  async getProgressBenchmark(userId: string, level: string): Promise<any> {
    const prompt = `Generate a progress benchmark report for user ${userId} preparing for JLPT ${level}.
Compare against JLPT passing thresholds and provide readiness assessment.
Format as JSON: {"userId": "...", "level": "...", "vocabularyReadiness": "percentage", "grammarReadiness": "...", "readingReadiness": "...", "listeningReadiness": "...", "overallReadiness": "...", "recommendations": "..."}`;

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
