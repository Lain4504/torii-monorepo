import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PayOS } from '@payos/node';
import { AppConfigService } from '@server/shared';

@Injectable()
export class PayOSService {
    private readonly logger = new Logger(PayOSService.name);
    private payOS: any;

    constructor(private readonly appConfig: AppConfigService) {
        const { clientId, apiKey, checksumKey } = this.appConfig.thirdParty.payos;

        if (!clientId || !apiKey || !checksumKey) {
            this.logger.warn('PayOS configuration is missing. Payment features will not work.');
        } else {
            this.logger.log(`Initializing PayOS with ClientID: ${clientId}`);
            this.payOS = new PayOS({ clientId, apiKey, checksumKey });
        }
    }

    async createPaymentLink(data: {
        orderCode: number;
        amount: number;
        description: string;
        cancelUrl: string;
        returnUrl: string;
        items?: { name: string; quantity: number; price: number }[];
    }) {
        if (!this.payOS) {
            throw new BadRequestException('PayOS is not configured');
        }

        try {
            const paymentLinkResponse = await this.payOS.createPaymentLink(data);
            return paymentLinkResponse;
        } catch (error: any) {
            this.logger.error(`Error creating PayOS payment link: ${error.message}`, error.stack);
            throw new BadRequestException(`PayOS error: ${error.message}`);
        }
    }

    verifyPaymentWebhookData(webhookData: any): any {
        if (!this.payOS) {
            throw new BadRequestException('PayOS is not configured');
        }
        // Verify signature
        const isValid = this.payOS.verifyPaymentWebhookData(webhookData);

        return isValid;
    }
}
