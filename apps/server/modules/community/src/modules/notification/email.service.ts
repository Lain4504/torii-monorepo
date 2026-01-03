import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly configService: ConfigService) { }

    /**
     * Send verification email
     */
    async sendVerificationEmail(email: string, otp: string): Promise<void> {
        // TODO: Integrate with real SMTP provider (e.g. Nodemailer, SendGrid, SES)

        // For Dev/Staging: Mock sending by logging
        this.logger.log(`=================================================`);
        this.logger.log(`📧 MOCK EMAIL TO: ${email}`);
        this.logger.log(`Subject: Verify your email`);
        this.logger.log(`Body: Your verification code is: ${otp}`);
        this.logger.log(`This code will expire in 24 hours.`);
        this.logger.log(`=================================================`);

        // In a real implementation:
        // await this.transporter.sendMail(...)
    }
}
