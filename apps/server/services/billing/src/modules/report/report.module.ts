import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportHandler } from './report.handler';
import { PrismaModule } from '@server/shared';

@Module({
  imports: [PrismaModule],
  controllers: [ReportHandler],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
