import {
    Controller,
    Post,
    Body,
    Inject,
    Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Public } from '@server/shared'; // Assuming a Public decorator exists or needs to be imported
import { successResponse, errorResponse } from '@server/shared';

@Controller('api/payos')
export class PayOSController {
    private readonly logger = new Logger(PayOSController.name);

    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('webhook')
    @Public()
    async handleWebhook(@Body() webhookData: any) {
        this.logger.log(`Received PayOS Webhook: ${JSON.stringify(webhookData)}`);
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.payos.webhook' },
                    webhookData
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Webhook processing failed: ${error.message}`);
            return errorResponse(error.message || 'Webhook processing failed');
        }
    }
}
