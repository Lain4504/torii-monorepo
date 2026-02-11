import { Module } from '@nestjs/common';
import { FastMcpModule } from '@server/agents/fastmcp/fastmcp.module';
import { SenseiService } from './sensei.service';
import { SharedModule, NatsClientModule } from '@server/shared';
import { TTSService } from './tts.service';

@Module({
    imports: [FastMcpModule, SharedModule, NatsClientModule],
    providers: [SenseiService, TTSService],
    exports: [SenseiService, TTSService],
})
export class SenseiModule { }
