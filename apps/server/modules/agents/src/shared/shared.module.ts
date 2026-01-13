import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiTemplateService } from './ai-template.service';

@Module({
  imports: [ConfigModule],
  providers: [AiService, AiTemplateService],
  exports: [AiService, AiTemplateService],
})
export class SharedModule {}
