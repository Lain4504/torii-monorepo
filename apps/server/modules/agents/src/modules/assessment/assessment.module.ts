import { Module } from '@nestjs/common';
import { FastMcpModule } from '../../fastmcp/fastmcp.module';
import { AssessmentService } from './assessment.service';

@Module({
    imports: [FastMcpModule],
    providers: [AssessmentService],
    exports: [AssessmentService],
})
export class AssessmentModule { }
