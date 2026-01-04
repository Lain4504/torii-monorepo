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
export class AnalyticsAgentService {
  async trackProgress(userId: string, activity: string, score?: number): Promise<any> {
    const prompt = `Analyze the following learning activity for user ${userId}: "${activity}"${score !== undefined ? ` with score: ${score}` : ''}.
Provide insights on:
1. Activity type and difficulty level
2. Performance assessment
3. Learning progress indicators
4. Recommendations for next steps
Format as JSON with: {"activityType": "...", "difficulty": "...", "performance": "...", "insights": "...", "recommendations": "..."}`;

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
        userId,
        activity,
        score,
        timestamp: new Date(),
        status: 'analyzed',
        ...parsed,
      };
    } catch (error) {
      // Return raw AI response instead of mock data
      return {
        userId,
        activity,
        score,
        timestamp: new Date(),
        status: 'analyzed',
        aiResponse: cleanResponse,
        error: 'Failed to parse AI response as JSON, returning raw text',
      };
    }
  }

  async suggestStudyPath(userId: string): Promise<any> {
    const prompt = `Create a personalized Japanese learning study path for user ${userId}.
Consider typical learner progress and provide:
1. Current assessment (beginner/intermediate/advanced)
2. Recommended focus areas (vocabulary, grammar, kanji, listening, speaking)
3. Daily/weekly study schedule
4. Specific goals and milestones
5. Resources and practice activities
6. Estimated time commitment
Format as JSON with: {"userLevel": "...", "focusAreas": [...], "schedule": {...}, "goals": [...], "resources": [...], "timeCommitment": "..."}`;

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
        userId,
        ...parsed,
        generatedAt: new Date(),
      };
    } catch (error) {
      // Return raw AI response instead of mock data
      return {
        userId,
        aiResponse: cleanResponse,
        error: 'Failed to parse AI response as JSON, returning raw text',
      };
    }
  }

  async identifyWeaknesses(userId: string): Promise<any> {
    const prompt = `Analyze learning data for user ${userId} to identify weaknesses.
Detect patterns in errors like recurring issues with polite forms, specific kanji radicals, etc.
Format as JSON: {"userId": "...", "weaknesses": [{"area": "grammar/vocab/kanji", "specificIssue": "...", "frequency": "...", "recommendation": "..."}]}`;

    const response = await callGemini(prompt);
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

  async predictReadiness(userId: string, level: string): Promise<any> {
    const prompt = `Predict JLPT ${level} readiness for user ${userId} based on learning trends.
Estimate exam score and predict dropout risk.
Format as JSON: {"userId": "...", "level": "...", "estimatedScore": "...", "readinessPercentage": "...", "dropoutRisk": "low/medium/high", "alerts": "..."}`;

    const response = await callGemini(prompt);
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

  async generateReport(userId: string, reportType: string): Promise<any> {
    const prompt = `Generate a ${reportType} report for user ${userId}.
If instructor report, provide aggregated insights; if personal, focus on individual progress.
Format as JSON: {"userId": "...", "reportType": "...", "summary": "...", "details": {...}, "exportable": true}`;

    const response = await callGemini(prompt);
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
