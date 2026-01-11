import { Injectable } from '@nestjs/common';
import { AiService } from './ai.service';

export interface AiTemplateRequest {
  template: string;
  params: Record<string, any>;
  outputFormat?: 'text' | 'json';
}

export interface AiFeatureTemplate {
  key: string;
  template: string;
  outputFormat: 'text' | 'json';
}

@Injectable()
export class AiTemplateService {
  private readonly templates: Map<string, AiFeatureTemplate> = new Map();

  constructor(private readonly aiService: AiService) {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Sensei Agent Templates
    this.addTemplate({
      key: 'sensei.grammar-check',
      template: `Analyze the following Japanese text for grammar correctness: "{{text}}".
Provide detailed feedback on:
1. Grammar errors and corrections
2. Suggestions for improvement
3. Overall assessment (correct, minor issues, needs work)
Be specific and helpful for language learners.`,
      outputFormat: 'text',
    });

    this.addTemplate({
      key: 'sensei.translate',
      template: `Translate the following text from {{from}} to {{to}}: "{{text}}".
Provide a natural, accurate translation. If translating to Japanese, include furigana for kanji.`,
      outputFormat: 'text',
    });

    this.addTemplate({
      key: 'sensei.flashcard',
      template: `Create a comprehensive flashcard for the Japanese word "{{word}}" with English meaning "{{meaning}}".
{{#if example}}Include this example sentence: "{{example}}"{{/if}}{{#unless example}}Create a relevant example sentence.{{/unless}}
Output only the JSON object with this format: {"word": "...", "reading": "...", "meaning": "...", "partOfSpeech": "...", "example": "...", "exampleTranslation": "...", "jlptLevel": "..."}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'sensei.practice-drill',
      template: `Generate a {{drillType}} practice drill for JLPT {{level}} level{{#if topic}} on the topic: {{topic}}{{/if}}.
Provide 5-10 exercises with answers and explanations.
For fill-in-the-gaps: provide sentence with blank, options, correct answer.
For sentence building: provide words, ask to build sentence.
For multiple-choice: provide question and options.
Output only the JSON object with this format: {"drillType": "...", "level": "...", "exercises": [{"question": "...", "options": [...], "correctAnswer": "...", "explanation": "..."}]}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'sensei.conversation-simulate',
      template: `Simulate a basic Japanese conversation for JLPT {{level}} level on the topic: {{topic}}.
Provide a dialogue with 4-6 exchanges, including English translations.
Output only the JSON object with this format: {"topic": "...", "level": "...", "dialogue": [{"speaker": "A", "japanese": "...", "english": "..."}]}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'sensei.resource-recommend',
      template: `Recommend supplementary materials for learning the Japanese concept: {{concept}} at JLPT {{level}} level.
Suggest videos, articles, exercises from JLPT-aligned resources.
Output only the JSON object with this format: {"concept": "...", "level": "...", "recommendations": [{"type": "video/article/exercise", "title": "...", "description": "...", "url": "..."}]}`,
      outputFormat: 'json',
    });

    // Assessment Agent Templates
    this.addTemplate({
      key: 'assessment.test-generate',
      template: `Create a customized JLPT-style test for level {{level}} focusing on {{focusAreas}}.
Generate {{questionCount}} questions total.
Include mix of question types: multiple-choice, reading comprehension, grammar, vocabulary.
Output only the JSON object with this format: {"testId": "...", "level": "...", "questions": [{"type": "...", "question": "...", "options": [...], "correctAnswer": "...", "explanation": "..."}]}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'assessment.evaluate',
      template: `Evaluate the following answers for JLPT {{level}} test.
Questions: {{questions}}
User answers: {{answers}}
Provide detailed scoring and feedback.
Output only the JSON object with this format: {"totalScore": ..., "maxScore": ..., "percentage": ..., "feedback": "...", "questionFeedback": [...]}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'assessment.progress-benchmark',
      template: `Generate a progress benchmark report for user {{userId}} preparing for JLPT {{level}}.
Compare against JLPT passing thresholds and provide readiness assessment.
Output only the JSON object with this format: {"userId": "...", "level": "...", "vocabularyReadiness": "percentage", "grammarReadiness": "...", "readingReadiness": "...", "listeningReadiness": "...", "overallReadiness": "...", "recommendations": "..."}`,
      outputFormat: 'json',
    });

    // Analytics Agent Templates
    this.addTemplate({
      key: 'analytics.progress-analyze',
      template: `Analyze the learning progress data: {{progressData}}
Identify strengths, weaknesses, and patterns.
Suggest personalized study recommendations.
Output only the JSON object with this format: {"strengths": [...], "weaknesses": [...], "recommendations": [...], "predictedReadiness": "..."}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'analytics.study-path',
      template: `Generate a personalized study path for user with JLPT target {{targetLevel}}.
Current level: {{currentLevel}}
Weak areas: {{weakAreas}}
Available time: {{timePerWeek}} hours/week
Output only the JSON object with this format: {"path": [...], "estimatedDuration": "...", "milestones": [...], "resources": [...]}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'analytics.weaknesses-identify',
      template: `Analyze learning data for user {{userId}} to identify weaknesses.
Detect patterns in errors like recurring issues with polite forms, specific kanji radicals, etc.
Output only the JSON object with this format: {"userId": "...", "weaknesses": [{"area": "grammar/vocab/kanji", "specificIssue": "...", "frequency": "...", "recommendation": "..."}]}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'analytics.readiness-predict',
      template: `Predict JLPT {{level}} readiness for user {{userId}} based on learning trends.
Estimate exam score and predict dropout risk.
Output only the JSON object with this format: {"userId": "...", "level": "...", "estimatedScore": "...", "readinessPercentage": "...", "dropoutRisk": "low/medium/high", "alerts": "..."}`,
      outputFormat: 'json',
    });

    this.addTemplate({
      key: 'analytics.report-generate',
      template: `Generate a {{reportType}} report for user {{userId}}.
If instructor report, provide aggregated insights; if personal, focus on individual progress.
Output only the JSON object with this format: {"userId": "...", "reportType": "...", "summary": "...", "details": {...}, "exportable": true}`,
      outputFormat: 'json',
    });
  }

  private addTemplate(template: AiFeatureTemplate) {
    this.templates.set(template.key, template);
  }

  async executeTemplate(key: string, params: Record<string, any>): Promise<any> {
    const template = this.templates.get(key);
    if (!template) {
      throw new Error(`AI template '${key}' not found`);
    }

    const prompt = this.renderTemplate(template.template, params);
    const response = await this.aiService.callGemini(prompt);

    if (template.outputFormat === 'json') {
      try {
        const cleanedResponse = this.cleanJsonResponse(response);
        return JSON.parse(cleanedResponse);
      } catch (error) {
        // Return raw response if JSON parsing fails
        return { rawResponse: response, error: 'Failed to parse JSON response' };
      }
    }

    return response;
  }

  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    // Also remove any other code block markers
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    return cleaned.trim();
  }

  private renderTemplate(template: string, params: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    // Handle conditional blocks like {{#if example}}...{{/if}}
    result = this.processConditionals(result, params);
    return result;
  }

  private processConditionals(template: string, params: Record<string, any>): string {
    // Simple conditional processing for {{#if key}}...{{/if}}
    const conditionalRegex = /{{#if (\w+)}}(.*?){{\/if}}/gs;
    return template.replace(conditionalRegex, (match, key, content) => {
      return params[key] ? content : '';
    });
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}
