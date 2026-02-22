import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ORDER_SERVICE_TOKEN, IOrderService } from '@server/billing/interfaces/services';
import { OrderCreateDTO, OrderQueryDTO, OrderConfirmDTO, PaymentQueryDTO } from '@workspace/schemas';
import { PayOSService } from '@server/billing/modules';

@Controller()
export class OrderHandler {
    constructor(
        @Inject(ORDER_SERVICE_TOKEN) private readonly orderService: IOrderService,
        private readonly payOSService: PayOSService
    ) { }

    @MessagePattern({ cmd: 'billing.order.findAll' })
    async findAll(@Payload() query: OrderQueryDTO) {
        return this.orderService.findAll(query);
    }

    @MessagePattern({ cmd: 'billing.order.findAllPayments' })
    async findAllPayments(@Payload() query: PaymentQueryDTO) {
        return this.orderService.findAllPayments(query);
    }

    @MessagePattern({ cmd: 'billing.order.findOne' })
    async findOne(@Payload() data: { id: string }) {
        return this.orderService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'billing.order.create' })
    async create(@Payload() data: OrderCreateDTO & { userId: string }) {
        const { userId, ...input } = data;
        return this.orderService.create(userId, input);
    }

    @MessagePattern({ cmd: 'billing.order.confirm' })
    async confirm(@Payload() data: { id: string, input: OrderConfirmDTO }) {
        return this.orderService.confirm(data.id, data.input);
    }

    // PayOS Webhook
    @MessagePattern({ cmd: 'billing.payos.webhook' })
    async handleWebhook(@Payload() webhookData: any) {
        // Verify webhook data
        const verifiedData = this.payOSService.verifyPaymentWebhookData(webhookData);
        // Handle the webhook in OrderService
        return this.orderService.handleWebhook(verifiedData);
    }

    @MessagePattern({ cmd: 'billing.order.cancel' })
    async cancel(@Payload() data: { id: string, userId: string, userRole: string }) {
        return this.orderService.cancel(data.id, data.userId, data.userRole);
    }

    @MessagePattern({ cmd: 'billing.order.refund' })
    async refund(@Payload() data: { id: string, reason?: string }) {
        return this.orderService.refund(data.id, data.reason);
    }
}
