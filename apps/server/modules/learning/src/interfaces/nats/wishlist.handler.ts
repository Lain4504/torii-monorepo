import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WishlistService } from '../../modules/wishlist/wishlist.service';
import { WishlistCreateDTO, WishlistQueryDTO } from '@workspace/schemas';

@Controller()
export class WishlistHandler {
    constructor(
        private readonly wishlistService: WishlistService,
    ) { }

    @MessagePattern({ cmd: 'learning.wishlist.findAll' })
    async findAll(@Payload() query: WishlistQueryDTO) {
        return this.wishlistService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.wishlist.findOne' })
    async findOne(@Payload() data: { id: string }) {
        return this.wishlistService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'learning.wishlist.create' })
    async create(@Payload() data: WishlistCreateDTO & { userId: string }) {
        const { userId, ...rest } = data;
        const input = { ...rest, userId };
        return this.wishlistService.create(input as WishlistCreateDTO);
    }

    @MessagePattern({ cmd: 'learning.wishlist.delete' })
    async delete(@Payload() data: { id: string }) {
        return this.wishlistService.delete(data.id);
    }

    @MessagePattern({ cmd: 'learning.wishlist.toggle' })
    async toggle(@Payload() data: { courseId: string, userId: string }) {
        return this.wishlistService.toggle(data.userId, data.courseId);
    }

    @MessagePattern({ cmd: 'learning.wishlist.check' })
    async checkWishlist(@Payload() data: { courseId: string, userId: string }) {
        if (!data.userId) return { isInWishlist: false };
        const isInWishlist = await this.wishlistService.isInWishlist(data.userId, data.courseId);
        return { isInWishlist };
    }
}
