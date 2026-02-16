import { Module } from '@nestjs/common';
import { FastMcpModule } from '../../fastmcp/fastmcp.module';
import { SenseiService } from './sensei.service';
import { TTSService } from './tts.service';

@Module({
    imports: [FastMcpModule],
    providers: [SenseiService, TTSService],
    exports: [SenseiService, TTSService],
})
export class SenseiModule { }
