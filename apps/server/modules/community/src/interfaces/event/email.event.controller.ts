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

interface PasswordResetRequestedEvent {
    email: string;
    displayName: string;
    resetToken: string;
    resetUrl: string;
}

interface PasswordResetCompletedEvent {
    email: string;
    displayName: string;
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

    @EventPattern('auth.password.reset-requested')
    async handlePasswordResetRequested(@Payload() payload: PasswordResetRequestedEvent) {
        this.logger.log(`Received auth.password.reset-requested event for ${payload.email}`);

        try {
            await this.emailService.sendPasswordResetEmail(
                payload.email,
                payload.displayName,
                payload.resetUrl
            );
        } catch (error) {
            this.logger.error(`Failed to handle auth.password.reset-requested event: ${error}`);
        }
    }

    @EventPattern('auth.password.reset-completed')
    async handlePasswordResetCompleted(@Payload() payload: PasswordResetCompletedEvent) {
        this.logger.log(`Received auth.password.reset-completed event for ${payload.email}`);

        try {
            await this.emailService.sendPasswordResetConfirmationEmail(
                payload.email,
                payload.displayName
            );
        } catch (error) {
            this.logger.error(`Failed to handle auth.password.reset-completed event: ${error}`);
        }
    }
}
