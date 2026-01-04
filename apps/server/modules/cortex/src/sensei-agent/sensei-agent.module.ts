import { Module } from '@nestjs/common';
import { SenseiAgentService } from './sensei-agent.service';
import { SenseiAgentController } from './sensei-agent.controller';

@Module({
  controllers: [SenseiAgentController],
  providers: [SenseiAgentService],
  exports: [SenseiAgentService],
})
export class SenseiAgentModule {}
