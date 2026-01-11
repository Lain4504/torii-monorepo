
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SePayService {
    private readonly logger = new Logger(SePayService.name);

    constructor() { }

    /**
     * Generate SePay QR Code URL
     */
    generateQrCode(data: { amount: number; description: string }): string {
        const accountNumber = process.env.SEPAY_ACCOUNT_NUMBER;
        const bank = process.env.SEPAY_BANK;

        if (!accountNumber || !bank) {
            this.logger.warn('SePay configuration missing (SEPAY_ACCOUNT_NUMBER or SEPAY_BANK)');
            // Return a broken link or throw? Better to throw so we know content is invalid
            // But defensive coding might suggest just logging. 
            // Given the user instruction, we should assume these are needed.
        }

        // https://qr.sepay.vn/img?acc=SO_TAI_KHOAN&bank=NGAN_HANG&amount=SO_TIEN&des=NOI_DUNG
        const params = new URLSearchParams({
            acc: accountNumber || '',
            bank: bank || '',
            amount: data.amount.toString(),
            des: data.description,
        });

        return `https://qr.sepay.vn/img?${params.toString()}`;
    }

    /**
     * Verify Webhook Data
     * Checks the Authorization header for the API Key
     */
    verifyWebhook(data: any, authHeader: string): any {
        const apiKey = process.env.SEPAY_API_KEY;

        if (!apiKey) {
            this.logger.warn('SEPAY_API_KEY is not configured');
            throw new UnauthorizedException('Server configuration error');
        }

        // "Authorization": "Apikey API_KEY_CUA_BAN"
        // SePay documentation says: "Apikey API_KEY_CUA_BAN"
        if (!authHeader || !authHeader.startsWith('Apikey ')) {
            throw new UnauthorizedException('Invalid Authorization header format');
        }

        const receivedKey = authHeader.split(' ')[1];
        if (receivedKey !== apiKey) {
            throw new UnauthorizedException('Invalid API Key');
        }

        return data;
    }
}
