import { Controller, Get, Post, Delete, Body, Param, Query, Logger, UseGuards, Req } from '@nestjs/common';
import { WishlistService } from '../../modules/wishlist/wishlist.service';
import {
    type WishlistCreateDTO,
    type WishlistQueryDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

@Controller('wishlists')
@UseGuards(GatewayAuthGuard)
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    async findAll(
        @Query() query: WishlistQueryDTO,
    ) {
        // Wishlist is usually personal, query typically contains userId or we filter by req.user.uid
        // Inspecting NATS controller: it took WishlistQueryDTO directly.
        return this.wishlistService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.wishlistService.findOne(id);
    }

    @Post()
    async create(
        @Body() input: WishlistCreateDTO,
        @Req() req: any,
    ) {
        if (!input.userId) input.userId = req.user.uid;
        return this.wishlistService.create(input);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.wishlistService.delete(id);
    }
}
