import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FastMcpService } from './fastmcp.service';
import { PrismaModule } from '@server/shared';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [FastMcpService],
  exports: [FastMcpService],
})
export class FastMcpModule {}
