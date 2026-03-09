import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class WebhookController {
    constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

    private async processPayOSWebhook(body: any) {
        const isSuccess = body?.success === true || body?.code === '00';
        if (!isSuccess) {
            return { ok: true, ignored: true, reason: 'PAYMENT_NOT_SUCCESS' };
        }

        const orderCode = body?.data?.orderCode?.toString();
        if (!orderCode) {
            return { ok: true, ignored: true, reason: 'MISSING_ORDER_CODE' };
        }

        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.order.handlePaymentSuccess' }, {
                orderCode,
                transactionId: body.data?.id,
                payload: body
            }),
        );
        return result;
    }

    // Public PayOS callback route (configured on PayOS dashboard)
    @Post('payos/webhook')
    async handlePayOSPublic(@Body() body: any) {
        return this.processPayOSWebhook(body);
    }
}
