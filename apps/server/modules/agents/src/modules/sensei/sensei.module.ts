import { Module } from '@nestjs/common';
import { FastMcpModule } from '../../fastmcp/fastmcp.module';
import { SenseiService } from './sensei.service';

@Module({
    imports: [FastMcpModule],
    providers: [SenseiService],
    exports: [SenseiService],
})
export class SenseiModule { }
