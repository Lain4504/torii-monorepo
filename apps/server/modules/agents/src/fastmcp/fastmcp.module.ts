import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FastMcpService } from './fastmcp.service';
import { McpController } from './mcp.controller';

@Module({
  imports: [SharedModule],
  providers: [FastMcpService],
  exports: [FastMcpService],
  controllers: [McpController],
})
export class FastMcpModule { }
