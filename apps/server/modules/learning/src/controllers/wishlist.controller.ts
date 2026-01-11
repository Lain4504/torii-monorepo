import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import {
    type WishlistCreateDTO,
    type WishlistQueryDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';
import { WishlistService } from '../modules/wishlist/wishlist.service';

/**
 * Wishlist HTTP Controller
 * Handles wishlist operations
 */
@Controller('wishlists')
@UseGuards(GatewayAuthGuard)
export class WishlistController {
    constructor(
        private readonly wishlistService: WishlistService,
    ) { }

    /**
     * Get all wishlists with pagination
     */
    @Get()
    async findAll(@Query() query: WishlistQueryDTO) {
        return this.wishlistService.findAll(query);
    }

    /**
     * Get wishlist by ID
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.wishlistService.findOne(id);
    }

    /**
     * Create new wishlist
     */
    @Post()
    async create(
        @Body() input: WishlistCreateDTO,
        @Req() req: any,
    ) {
        const userId = req.user?.sub || req.user?.uid;
        if (!userId) {
            throw new Error('User ID not found in request');
        }
        if (!input.userId) {
            input.userId = userId;
        }
        return this.wishlistService.create(input);
    }

    /**
     * Delete wishlist by ID
     */
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.wishlistService.delete(id);
    }

    /**
     * Toggle wishlist (add/remove course from wishlist)
     */
    @Post('toggle/:courseId')
    async toggle(
        @Param('courseId') courseId: string,
        @Req() req: any,
    ) {
        const userId = req.user?.sub || req.user?.uid;
        if (!userId) {
            throw new Error('User ID not found in request');
        }
        return this.wishlistService.toggle(userId, courseId);
    }

    /**
     * Check if course is in wishlist
     */
    @Get('check/:courseId')
    async checkWishlist(
        @Param('courseId') courseId: string,
        @Req() req: any,
    ) {
        const userId = req.user?.sub || req.user?.uid;
        if (!userId) {
            return { isInWishlist: false };
        }
        const isInWishlist = await this.wishlistService.isInWishlist(userId, courseId);
        return { isInWishlist };
    }
}

