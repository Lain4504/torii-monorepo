import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { PayOS } from '@payos/node';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayOSService {
    private readonly logger = new Logger(PayOSService.name);
    private payOS: any;

    constructor(private readonly configService: ConfigService) {
        const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
        const apiKey = this.configService.get<string>('PAYOS_API_KEY');
        const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

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
            const paymentLinkResponse = await this.payOS.paymentRequests.create(data);
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
        try {
            // This method verifies the signature and returns the verified data (webhookData.data)
            return this.payOS.verifyPaymentWebhookData(webhookData);
        } catch (error: any) {
            this.logger.error(`PayOS webhook signature verification failed: ${error.message}`);
            throw new BadRequestException('Invalid payment signature');
        }
    }
}
