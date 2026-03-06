import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('api/webhooks')
export class WebhookController {
    constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

    @Post('payos')
    async handlePayOS(@Body() body: any) {
        // We forward the entire payload to the academy service
        // Verification should happen in the service or here. 
        // Usually, verification is better in the service that has the keys.
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.order.handlePaymentSuccess' }, {
                orderCode: body.data?.orderCode?.toString(),
                transactionId: body.data?.id,
                payload: body
            }),
        );
        return result;
    }
}
