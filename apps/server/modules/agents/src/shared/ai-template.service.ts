// filepath: /home/thanhphuong/Documents/MyLearning/SEP490/torii-monorepo/apps/server/modules/agents/src/shared/agent-template.service.ts
import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { AiTemplateDefinition } from './interfaces/template.interface';
import { AiService } from './ai.service';

// Register Handlebars helpers
Handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});
Handlebars.registerHelper('json', function(obj) {
  return JSON.stringify(obj, null, 2);
});

export interface AiExecutionResult<T = any> {
  success: boolean;
  data?: T;
  rawResponse?: string;
  error?: string;
}

@Injectable()
export class AiTemplateService {
  private readonly registry: Map<string, AiTemplateDefinition> = new Map();

  constructor(private readonly aiService: AiService) {}

  // Cho phép các Agent đăng ký template của riêng mình
  register(definition: AiTemplateDefinition) {
    this.registry.set(definition.key, definition);
  }

  async execute<T>(key: string, params: any): Promise<AiExecutionResult<T>> {
    const def = this.registry.get(key);
    if (!def) {
      return {
        success: false,
        error: `Template ${key} not found`,
      };
    }

    try {
      // 1. Validate Input (Optional)
      if (def.inputSchema) def.inputSchema.parse(params);

      // 2. Render Template (Dùng Handlebars)
      const prompt = Handlebars.compile(def.template)(params);

      // 3. Call AI
      const rawResponse = await this.aiService.callGemini(prompt);

      // 4. Parse & Validate Output
      if (def.outputFormat === 'json') {
        const json = JSON.parse(this.aiService.cleanJsonResponse(rawResponse));
        const validatedData = def.outputSchema ? def.outputSchema.parse(json) : json;
        return {
          success: true,
          data: validatedData,
        };
      }

      return {
        success: true,
        data: rawResponse as any,
      };
    } catch (error) {
      return {
        success: false,
        rawResponse: error.response?.data || error.message || 'Unknown error',
        error: error.message || 'AI execution failed',
      };
    }
  }

  // Keep the old method name for backward compatibility during transition
  async executeTemplate<T>(key: string, params: any): Promise<AiExecutionResult<T> | T> {
    const result = await this.execute<T>(key, params);
    if (result.success) {
      return result.data!;
    }
    // Return the result object for backward compatibility
    return result;
  }
}