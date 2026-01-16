
import {
    Controller,
    Post,
    Body,
    Get,
    Inject,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Public } from '@server/shared';
import { PayOSService } from '../modules/payment/payos.service';
import { IOrderService, ORDER_SERVICE_TOKEN } from '../interfaces/services';

@Controller('payos')
export class PayOSController {
    private readonly logger = new Logger(PayOSController.name);

    constructor(
        private readonly payOSService: PayOSService,
        @Inject(ORDER_SERVICE_TOKEN) private readonly orderService: IOrderService,
    ) { }

    @Post('webhook')
    @Public()
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Body() webhookData: any) {
        this.logger.log(`Received PayOS Webhook: ${JSON.stringify(webhookData)}`);

        // Verify webhook data
        const verifiedData = this.payOSService.verifyPaymentWebhookData(webhookData);

        // Handle the webhook in OrderService
        return this.orderService.handleWebhook(verifiedData);
    }
}
