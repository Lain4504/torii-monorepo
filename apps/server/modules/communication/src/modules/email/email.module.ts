import { Module } from '@nestjs/common';
import { SharedEmailModule } from '@server/shared';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

/**
 * Email Module
 * Handles email operations via NATS events
 */
@Module({
    imports: [SharedEmailModule],
    controllers: [EmailController],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule { }
