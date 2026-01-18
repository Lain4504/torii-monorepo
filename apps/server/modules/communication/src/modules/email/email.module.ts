import { Module } from '@nestjs/common';
import { SharedEmailModule } from '@server/shared';
import { EmailService } from './email.service';

/**
 * Email Module
 * Handles email operations
 */
@Module({
    imports: [SharedEmailModule],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule { }
