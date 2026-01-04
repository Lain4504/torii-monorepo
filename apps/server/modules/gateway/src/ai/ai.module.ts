import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [NatsClientModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
