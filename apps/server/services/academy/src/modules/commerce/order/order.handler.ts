import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { OrderCheckoutDto, OrderPreviewDto } from './dto/order.dto';

@Controller()
export class OrderHandler {
    constructor(private readonly orderService: OrderService) { }

    @MessagePattern({ cmd: 'academy.order.preview' })
    preview(@Payload() data: { userId: string; input: OrderPreviewDto }) {
        return this.orderService.preview(data.userId, data.input);
    }

    @MessagePattern({ cmd: 'academy.order.checkout' })
    checkout(@Payload() data: { userId: string; input: OrderCheckoutDto }) {
        return this.orderService.checkout(data.userId, data.input);
    }

    @MessagePattern({ cmd: 'academy.order.handlePaymentSuccess' })
    handlePaymentSuccess(@Payload() data: { orderCode: string; transactionId?: string; payload?: any }) {
        return this.orderService.handlePaymentSuccess(data.orderCode, data.transactionId, data.payload);
    }

    // --- Admin CRUD ---

    @MessagePattern({ cmd: 'academy.order.admin.findAll' })
    admin_findAll(@Payload() query: any) {
        return this.orderService.admin_findAll(query);
    }

    @MessagePattern({ cmd: 'academy.order.admin.findOne' })
    admin_findOne(@Payload() data: { id: string }) {
        return this.orderService.admin_findOne(data.id);
    }

    @MessagePattern({ cmd: 'academy.order.admin.updateStatus' })
    admin_updateStatus(@Payload() data: { id: string; status: any; requesterId?: string }) {
        return this.orderService.admin_updateStatus(data.id, data.status, data.requesterId);
    }
}
