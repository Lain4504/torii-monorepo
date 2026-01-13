// filepath: /home/thanhphuong/Documents/MyLearning/SEP490/torii-monorepo/apps/server/modules/agents/src/shared/agent-template.service.ts
import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { AiTemplateDefinition } from './interfaces/template.interface';
import { AiService } from './ai.service';

@Injectable()
export class AiTemplateService {
  private readonly registry: Map<string, AiTemplateDefinition> = new Map();

  constructor(private readonly aiService: AiService) {}

  // Cho phép các Agent đăng ký template của riêng mình
  register(definition: AiTemplateDefinition) {
    this.registry.set(definition.key, definition);
  }

  async execute<T>(key: string, params: any): Promise<T> {
    const def = this.registry.get(key);
    if (!def) throw new Error(`Template ${key} not found`);

    // 1. Validate Input (Optional)
    if (def.inputSchema) def.inputSchema.parse(params);

    // 2. Render Template (Dùng Handlebars)
    const prompt = Handlebars.compile(def.template)(params);

    // 3. Call AI
    const rawResponse = await this.aiService.callGemini(prompt);

    // 4. Parse & Validate Output
    if (def.outputFormat === 'json') {
      const json = JSON.parse(this.aiService.cleanJsonResponse(rawResponse));
      return def.outputSchema ? def.outputSchema.parse(json) : json;
    }

    return rawResponse as any;
  }

  // Keep the old method name for backward compatibility during transition
  async executeTemplate<T>(key: string, params: any): Promise<T> {
    return this.execute<T>(key, params);
  }
}