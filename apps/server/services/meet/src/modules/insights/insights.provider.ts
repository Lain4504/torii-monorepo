import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '@server/shared';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
} from '@google/generative-ai';
import axios from 'axios';
import {
  InsightsAITextChatContent,
  InsightsAITextChatStreamResult,
  InsightsAITextChatStreamResultSchema,
  InsightsTextTranslationResult,
  InsightsTextTranslationResultSchema,
  InsightsSupportedLangInfo,
  InsightsSupportedLangInfoSchema,
} from '@workspace/protocol';
import { v4 as uuidv4 } from 'uuid';
import { create } from '@bufbuild/protobuf';

@Injectable()
export class InsightsProviderService {
  private readonly logger = new Logger(InsightsProviderService.name);
  private googleClient: GoogleGenerativeAI | null = null;

  constructor(private readonly appConfig: AppConfigService) {
    this.initializeGoogleClient();
  }

  private initializeGoogleClient() {
    const apiKey = this.appConfig.thirdParty?.gemini?.apiKey;
    if (apiKey) {
      this.googleClient = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('Google Gemini API key not configured');
    }
  }

  // --- Google Gemini Implementation for Chat & Summary ---

  async *aiTextChatStream(
    modelName: string,
    history: InsightsAITextChatContent[],
  ): AsyncGenerator<InsightsAITextChatStreamResult> {
    if (!this.googleClient) {
      throw new Error('Google Gemini client not initialized');
    }

    const model = this.googleClient.getGenerativeModel({
      model: modelName || 'gemini-pro',
    });
    const streamId = uuidv4();
    const now = Date.now().toString();

    if (history.length === 0) {
      throw new Error('History is empty');
    }

    // The last message is the new prompt.
    const lastMsg = history[history.length - 1];
    // Previous history
    const prevHistory = history.slice(0, history.length - 1);

    const chatSession = model.startChat({
      history: prevHistory
        .filter((h) => h.role === 2 || h.role === 3) // Filter User(2) and Model(3). Skip System(1).
        .map((h) => ({
          role: h.role === 2 ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
    });

    try {
      const result = await chatSession.sendMessageStream(lastMsg.text);

      let promptTokens = 0;
      let completionTokens = 0;
      let totalTokens = 0;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();

        // Track usage if available in chunk
        if (chunk.usageMetadata) {
          promptTokens = chunk.usageMetadata.promptTokenCount;
          completionTokens = chunk.usageMetadata.candidatesTokenCount;
          totalTokens = chunk.usageMetadata.totalTokenCount;
        }

        yield create(InsightsAITextChatStreamResultSchema, {
          id: streamId,
          text: chunkText,
          createdAt: now,
        });
      }

      // If usage wasn't in chunks, get it from final response
      const finalResponse = await result.response;
      if (finalResponse.usageMetadata) {
        promptTokens = finalResponse.usageMetadata.promptTokenCount;
        completionTokens = finalResponse.usageMetadata.candidatesTokenCount;
        totalTokens = finalResponse.usageMetadata.totalTokenCount;
      }

      // Yield final chunk with usage
      yield create(InsightsAITextChatStreamResultSchema, {
        id: streamId,
        isLastChunk: true,
        promptTokens,
        completionTokens,
        totalTokens,
        createdAt: Date.now().toString(),
      });
    } catch (error) {
      this.logger.error(`Gemini stream error: ${error.message}`);
      throw error;
    }
  }

  async aiChatTextSummarize(
    modelName: string,
    history: InsightsAITextChatContent[],
  ): Promise<{
    summary: string;
    promptTokens: number;
    completionTokens: number;
  }> {
    if (!this.googleClient) {
      throw new Error('Google Gemini client not initialized');
    }

    const model = this.googleClient.getGenerativeModel({
      model: modelName || 'gemini-pro',
    });

    // Prepare prompt
    const conversation = history
      .map((h) => `${h.role === 2 ? 'User' : 'AI'}: ${h.text}`)
      .join('\n');
    const prompt = `Summarize the following conversation in a concise paragraph:\n\n${conversation}`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    return {
      summary: response.text(),
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
    };
  }

  // --- Azure Implementation for Translation ---

  async translateText(
    text: string,
    sourceLang: string,
    targetLangs: string[],
  ): Promise<InsightsTextTranslationResult> {
    const azureKeys = this.appConfig.azureSpeech?.subscriptionKeys;
    if (!azureKeys || azureKeys.length === 0) {
      throw new Error('Azure subscription keys not configured');
    }

    // Pick first key
    const key = azureKeys[0];
    const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0`;

    const params = new URLSearchParams();
    params.append('from', sourceLang);
    targetLangs.forEach((lang) => params.append('to', lang));

    try {
      const response = await axios.post(
        `${endpoint}&${params.toString()}`,
        [{ Text: text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': key.subscriptionKey,
            'Ocp-Apim-Subscription-Region': key.serviceRegion,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(
          `Azure translation failed with status ${response.status}`,
        );
      }

      const data = response.data;
      if (!data || data.length === 0 || !data[0].translations) {
        throw new Error('Invalid response from Azure');
      }

      const translations: Record<string, string> = {};
      data[0].translations.forEach((t: any) => {
        translations[t.to] = t.text;
      });

      return create(InsightsTextTranslationResultSchema, {
        sourceText: text,
        sourceLang: sourceLang,
        translations: translations,
      });
    } catch (error) {
      this.logger.error(`Azure translation error: ${error.message}`);
      throw error;
    }
  }
}
