import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { OrderCheckoutDto, OrderPreviewDto } from './dto/order.dto';

@Controller()
export class OrderHandler {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'academy.order.preview' })
  preview(@Payload() data: { userId: string; input: OrderPreviewDto }) {
    return this.orderService.preview(data.userId, data.input);
  }

  @MessagePattern({ cmd: 'academy.order.checkout' })
  checkout(@Payload() data: { userId: string; input: OrderCheckoutDto }) {
    return this.orderService.checkout(data.userId, data.input);
  }

  @MessagePattern({ cmd: 'academy.order.handlePaymentSuccess' })
  handlePaymentSuccess(
    @Payload()
    data: {
      orderCode: string;
      transactionId?: string;
      payload?: any;
    },
  ) {
    return this.orderService.handlePaymentSuccess(
      data.orderCode,
      data.transactionId,
      data.payload,
    );
  }

  // --- Admin CRUD ---

  @MessagePattern({ cmd: 'academy.order.admin.findAll' })
  admin_findAll(@Payload() query: any) {
    return this.orderService.admin_findAll(query);
  }

  @MessagePattern({ cmd: 'academy.order.admin.getStats' })
  admin_getStats(@Payload() query: any) {
    return this.orderService.admin_getStats(query);
  }

  @MessagePattern({ cmd: 'academy.order.admin.findByOffering' })
  admin_findByOffering(@Payload() data: { offeringId: string; query: any }) {
    return this.orderService.admin_findOrdersByOffering(
      data.offeringId,
      data.query,
    );
  }

  @MessagePattern({ cmd: 'academy.order.admin.getStatsByOffering' })
  admin_getStatsByOffering(@Payload() data: { offeringId: string }) {
    return this.orderService.admin_getStatsByOffering(data.offeringId);
  }

  @MessagePattern({ cmd: 'academy.order.admin.findOne' })
  admin_findOne(@Payload() data: { id: string }) {
    return this.orderService.admin_findOne(data.id);
  }

  @MessagePattern({ cmd: 'academy.order.admin.updateStatus' })
  admin_updateStatus(
    @Payload() data: { id: string; status: any; requesterId?: string },
  ) {
    return this.orderService.admin_updateStatus(
      data.id,
      data.status,
      data.requesterId,
    );
  }

  @MessagePattern({ cmd: 'academy.order.admin.cancel' })
  admin_cancel(@Payload() data: { id: string; requesterId?: string }) {
    return this.orderService.admin_cancel(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.order.admin.export' })
  admin_export(@Payload() query: any) {
    return this.orderService.admin_exportOrders(query);
  }

  @MessagePattern({ cmd: 'academy.order.findByCodeForUser' })

  findByCodeForUser(@Payload() data: { userId: string; orderCode: string }) {
    return this.orderService.getByCodeForUser(data.userId, data.orderCode);
  }

  @MessagePattern({ cmd: 'academy.order.findAllForUser' })
  findAllForUser(
    @Payload()
    data: {
      userId: string;
      query: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
      };
    },
  ) {
    return this.orderService.findAllForUser(data.userId, data.query ?? {});
  }

  @MessagePattern({ cmd: 'academy.order.findOneForUser' })
  findOneForUser(@Payload() data: { userId: string; id: string }) {
    return this.orderService.findOneForUser(data.userId, data.id);
  }

  @MessagePattern({ cmd: 'academy.order.repay' })
  repay(@Payload() data: { userId: string; orderId: string }) {
    return this.orderService.repayOrder(data.userId, data.orderId);
  }
}
