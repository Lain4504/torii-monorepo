import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';

@Injectable()
export class PaymentCron {
    private readonly logger = new Logger(PaymentCron.name);

    constructor(private readonly orderService: OrderService) { }

    /**
     * Cronjob to auto-cancel pending orders that are older than 30 minutes
     * Runs every 5 minutes
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleAutoCancelOrders() {
        this.logger.log('Triggering automated order cancellation check...');
        try {
            await this.orderService.autoCancelExpiredOrders();
        } catch (error: any) {
            this.logger.error(`Failed to execute auto-cancel orders: ${error.message}`);
        }
    }
}