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
}
