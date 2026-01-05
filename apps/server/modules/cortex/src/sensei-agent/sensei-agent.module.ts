import { Module } from '@nestjs/common';
import { SenseiAgentService } from './sensei-agent.service';

@Module({
  controllers: [],
  providers: [SenseiAgentService],
  exports: [SenseiAgentService],
})
export class SenseiAgentModule {}
