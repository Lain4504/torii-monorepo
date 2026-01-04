import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../../modules/notification/email.service';

interface UserRegisteredEvent {
    email: string;
    displayName: string;
    magicToken: string;
    verificationUrl: string;
}

interface VerificationResendEvent {
    email: string;
    displayName: string;
    magicToken: string;
    verificationUrl: string;
}

@Controller()
export class EmailEventController {
    private readonly logger = new Logger(EmailEventController.name);

    constructor(private readonly emailService: EmailService) { }

    @EventPattern('auth.user.registered')
    async handleUserRegistered(@Payload() payload: UserRegisteredEvent) {
        this.logger.log(`Received auth.user.registered event for ${payload.email}`);

        try {
            await this.emailService.sendVerificationEmail(
                payload.email,
                payload.displayName,
                payload.verificationUrl
            );
        } catch (error) {
            this.logger.error(`Failed to handle auth.user.registered event: ${error}`);
        }
    }

    @EventPattern('auth.verification.resend')
    async handleVerificationResend(@Payload() payload: VerificationResendEvent) {
        this.logger.log(`Received auth.verification.resend event for ${payload.email}`);

        try {
            await this.emailService.sendVerificationEmail(
                payload.email,
                payload.displayName,
                payload.verificationUrl
            );
        } catch (error) {
            this.logger.error(`Failed to handle auth.verification.resend event: ${error}`);
        }
    }
}
