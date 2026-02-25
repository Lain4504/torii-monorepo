import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { Cart, CartItem, Prisma } from '@prisma/generated';

@Injectable()
export class CartRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: string): Promise<Cart & { items: (CartItem & { course: any })[] } | null> {
        // Ensure cart exists or return null (Service handles creation usually, or findOrCreate here)
        return this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        course: true, // Include course details for display
                    },
                    orderBy: {
                        addedAt: 'desc',
                    },
                },
            },
        });
    }

    async findOrCreate(userId: string): Promise<Cart> {
        const cart = await this.prisma.cart.findUnique({ where: { userId } });
        if (cart) return cart;
        return this.prisma.cart.create({ data: { userId } });
    }

    async addItem(cartId: string, courseId: string): Promise<CartItem> {
        return this.prisma.cartItem.create({
            data: {
                cartId,
                courseId,
            },
        });
    }

    async removeItem(cartId: string, courseId: string): Promise<void> {
        // Use deleteMany to avoid error if not found, or unique composite ID
        await this.prisma.cartItem.deleteMany({
            where: {
                cartId,
                courseId,
            },
        });
    }

    async clearCart(cartId: string): Promise<void> {
        await this.prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }

    async countItems(cartId: string): Promise<number> {
        return this.prisma.cartItem.count({
            where: { cartId },
        });
    }

    async getItem(cartId: string, courseId: string): Promise<CartItem | null> {
        return this.prisma.cartItem.findUnique({
            where: {
                cartId_courseId: {
                    cartId,
                    courseId,
                },
            },
        });
    }
}
