import { Module } from '@nestjs/common';
import { FastMcpModule } from '@server/agents/fastmcp/fastmcp.module';

import { AssessmentService } from './assessment.service';
import { AssessmentHandler } from './assessment.handler';

@Module({
  imports: [FastMcpModule],
  controllers: [AssessmentHandler],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
