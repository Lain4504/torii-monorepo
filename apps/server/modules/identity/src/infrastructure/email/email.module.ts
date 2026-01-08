import { Module } from '@nestjs/common';
import { SharedEmailModule } from '@server/shared';
import { EmailService } from './email.service';
import { EMAIL_SERVICE_TOKEN } from '../../interfaces/services';

@Module({
    imports: [SharedEmailModule],
    providers: [
        {
            provide: EMAIL_SERVICE_TOKEN,
            useClass: EmailService,
        },
    ],
    exports: [EMAIL_SERVICE_TOKEN],
})
export class EmailModule { }
