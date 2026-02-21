import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReportService } from '../../modules/report/report.service';

@Controller()
export class ReportHandler {
  constructor(private readonly reportService: ReportService) {}

  @MessagePattern({ cmd: 'billing.report.export-orders' })
  async exportOrders(
    @Payload() query: { startDate?: string; endDate?: string },
  ) {
    const buffer = await this.reportService.exportOrders(query);
    return Array.from(new Uint8Array(buffer));
  }

  @MessagePattern({ cmd: 'billing.report.export-balance' })
  async exportBalance(
    @Payload() query: { startDate?: string; endDate?: string },
  ) {
    const buffer = await this.reportService.exportBalanceHistory(query);
    return Array.from(new Uint8Array(buffer));
  }

  @MessagePattern({ cmd: 'billing.report.export-revenue' })
  async exportRevenue() {
    const buffer = await this.reportService.exportCourseRevenue();
    return Array.from(new Uint8Array(buffer));
  }
}
