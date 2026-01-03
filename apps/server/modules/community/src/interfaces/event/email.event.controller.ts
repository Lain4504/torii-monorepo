import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../../modules/notification/email.service';

@Controller()
export class EmailEventController {
    private readonly logger = new Logger(EmailEventController.name);

    constructor(private readonly emailService: EmailService) { }

    @EventPattern('auth.user.registered')
    async handleUserRegistered(@Payload() payload: { email: string; otp: string }) {
        this.logger.log(`Received auth.user.registered event for ${payload.email}`);

        try {
            await this.emailService.sendVerificationEmail(payload.email, payload.otp);
        } catch (error) {
            this.logger.error(`Failed to handle auth.user.registered event: ${error}`);
        }
    }
}
