/**
 * Webhook Module
 */

import { Module } from '@nestjs/common';
import { WebhookNotifierService } from './webhook-notifier.service';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { SharedModule } from '@server/shared';

@Module({
    imports: [SharedModule],
    controllers: [WebhookController],
    providers: [WebhookNotifierService, WebhookService],
    exports: [WebhookNotifierService, WebhookService],
})
export class WebhookModule { }
