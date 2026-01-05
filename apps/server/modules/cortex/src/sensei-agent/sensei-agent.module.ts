import { Module } from '@nestjs/common';
import { SenseiAgentService } from './sensei-agent.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [SenseiAgentService],
  exports: [SenseiAgentService],
})
export class SenseiAgentModule {}
