import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuotaService } from './quota.service';

@Controller()
export class QuotaHandler {
    private readonly logger = new Logger(QuotaHandler.name);

    constructor(private readonly quotaService: QuotaService) { }

    @MessagePattern({ cmd: 'billing.quota.checkAndConsume' })
    async checkAndConsume(
        @Payload() data: { userId: string; feature?: string },
    ) {
        try {
            return await this.quotaService.checkAndConsume(data.userId, data.feature);
        } catch (error: any) {
            this.logger.error(`Error in billing.quota.checkAndConsume: ${error.message}`, error.stack);
            return { allowed: false, error: error.message };
        }
    }

    @MessagePattern({ cmd: 'billing.quota.getStatus' })
    async getStatus(@Payload() data: { userId: string; feature?: string }) {
        try {
            return await this.quotaService.getStatus(data.userId, data.feature);
        } catch (error: any) {
            this.logger.error(`Error in billing.quota.getStatus: ${error.message}`, error.stack);
            return { error: error.message };
        }
    }
}
