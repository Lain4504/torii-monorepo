import { Module } from '@nestjs/common';
import { SenseiAgentService } from './sensei-agent.service';
import { SharedModule } from '../shared/shared.module';
import { SENSEI_AGENT_SERVICE_TOKEN } from '../interfaces/services';
import { SenseiAgentController } from '../messaging/sensei-agent.controller';
import { PrismaModule } from '@server/shared';

@Module({
  imports: [SharedModule, PrismaModule],
  controllers: [SenseiAgentController],
  providers: [
    {
      provide: SENSEI_AGENT_SERVICE_TOKEN,
      useClass: SenseiAgentService,
    },
  ],
  exports: [SENSEI_AGENT_SERVICE_TOKEN],
})
export class SenseiAgentModule {}
