import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;
  private readonly GEMINI_TIMEOUT_MS = 15000; // 15 seconds timeout for Gemini API calls

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  // Generic helper to enforce a timeout on a promise
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Gemini API request timed out'));
      }, ms);
      promise.then(
        (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
      );
    });
  }

  // Helper function for AI calls with error handling
  async callGemini(prompt: string): Promise<string> {
    try {
      const result = await this.withTimeout(this.model.generateContent(prompt), this.GEMINI_TIMEOUT_MS);
      return (result as any).response.text();
    } catch (error: any) {
      this.logger.error('Gemini API error:', error);
      const message = error && error.message ? error.message : 'Unknown error';
      return `Error: Unable to process request. ${message}`;
    }
  }
}
