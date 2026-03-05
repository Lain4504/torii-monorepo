import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ORDER_SERVICE_TOKEN,
  IOrderService,
} from '@server/billing/interfaces/services';
import {
  OrderCreateDTO,
  OrderQueryDTO,
  OrderConfirmDTO,
  PaymentQueryDTO,
} from '@workspace/schemas';
import { PayOSService } from '@server/billing/modules/payment/payos.service';

@Controller()
export class OrderHandler {
  constructor(
    @Inject(ORDER_SERVICE_TOKEN) private readonly orderService: IOrderService,
    private readonly payOSService: PayOSService,
  ) {}

  @MessagePattern({ cmd: 'billing.order.findAll' })
  async findAll(@Payload() query: OrderQueryDTO) {
    return this.orderService.findAll(query);
  }

  @MessagePattern({ cmd: 'billing.order.getStats' })
  async getStats(@Payload() query: OrderQueryDTO) {
    return this.orderService.getStats(query);
  }

  @MessagePattern({ cmd: 'billing.order.findAllPayments' })
  async findAllPayments(@Payload() query: PaymentQueryDTO) {
    return this.orderService.findAllPayments(query);
  }

  @MessagePattern({ cmd: 'billing.order.findById' })
  async findById(@Payload() data: { id: string }) {
    return this.orderService.findById(data.id);
  }

  @MessagePattern({ cmd: 'billing.order.create' })
  async create(@Payload() data: OrderCreateDTO & { userId: string }) {
    const { userId, ...input } = data;
    return this.orderService.create(userId, input);
  }

  @MessagePattern({ cmd: 'billing.order.confirm' })
  async confirm(@Payload() data: { id: string; input: OrderConfirmDTO }) {
    return this.orderService.confirm(data.id, data.input);
  }

  @MessagePattern({ cmd: 'billing.payos.webhook' })
  async handleWebhook(@Payload() webhookData: any) {
    this.payOSService.verifyPaymentWebhookData(webhookData);
    return this.orderService.handleWebhook(webhookData.data);
  }

  @MessagePattern({ cmd: 'billing.order.cancel' })
  async cancel(
    @Payload() data: { id: string; userId: string; userRole: string },
  ) {
    return this.orderService.cancel(data.id, data.userId, data.userRole);
  }

  @MessagePattern({ cmd: 'billing.order.refund' })
  async refund(@Payload() data: { id: string; reason?: string }) {
    return this.orderService.refund(data.id, data.reason);
  }

  @MessagePattern({ cmd: 'billing.order.export' })
  async export(@Payload() query: OrderQueryDTO) {
    return this.orderService.exportOrders(query);
  }
}
