import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from '@server/learning/modules/cart/cart.service';

@Controller()
export class CartHandler {
    constructor(private readonly cartService: CartService) { }

    @MessagePattern('cart.get')
    async getCart(@Payload() data: { userId: string }) {
        return this.cartService.getCart(data.userId);
    }

    @MessagePattern('cart.add')
    async addToCart(@Payload() data: { userId: string; courseId: string }) {
        return this.cartService.addToCart(data.userId, data.courseId);
    }

    @MessagePattern('cart.remove')
    async removeFromCart(@Payload() data: { userId: string; courseId: string }) {
        return this.cartService.removeFromCart(data.userId, data.courseId);
    }

    @MessagePattern('cart.clear')
    async clearCart(@Payload() data: { userId: string }) {
        return this.cartService.clearCart(data.userId);
    }
}
