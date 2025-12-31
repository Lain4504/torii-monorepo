import { Module } from '@nestjs/common';
import { SenseiAgentService } from './sensei-agent.service';

@Module({
  providers: [SenseiAgentService],
  exports: [SenseiAgentService],
})
export class SenseiAgentModule {}
