import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { GamificationProfileService } from './gamification-profile.service';
import { StreakService } from './streak.service';

@Injectable()
export class ShopService {
    private readonly logger = new Logger(ShopService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly profileService: GamificationProfileService,
        private readonly streakService: StreakService,
    ) { }

    /**
     * Get all active shop items
     */
    async getShopItems() {
        return this.prisma.shopItem.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }

    /**
     * Buy an item from the shop
     */
    async buyItem(userId: string, itemCode: string) {
        const item = await this.prisma.shopItem.findUnique({
            where: { code: itemCode },
        });

        if (!item || !item.isActive) {
            throw new BadRequestException('Item not found or inactive');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { coins: true },
        });

        if (!user || user.coins < item.price) {
            throw new BadRequestException('Not enough coins');
        }

        // Transaction for buying
        return this.prisma.$transaction(async (tx) => {
            // 1. Deduct coins
            await tx.user.update({
                where: { id: userId },
                data: { coins: { decrement: item.price } },
            });

            // 2. Apply item effect or add to inventory
            let result;
            switch (item.code) {
                case 'STREAK_FREEZE':
                    await tx.userStreak.update({
                        where: { userId },
                        data: { freezeCount: { increment: 1 } },
                    });
                    result = { success: true, message: 'Streak Freeze added' };
                    break;

                case 'HEART_REFILL':
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            hearts: 5, // MAX_HEARTS
                            lastHeartRefill: new Date()
                        },
                    });
                    result = { success: true, message: 'Hearts refilled' };
                    break;

                default:
                    // Generic inventory item
                    await tx.userInventory.upsert({
                        where: { userId_itemId: { userId, itemId: item.id } },
                        update: { quantity: { increment: 1 } },
                        create: { userId, itemId: item.id, quantity: 1 },
                    });
                    result = { success: true, message: 'Item added to inventory' };
            }

            this.logger.log(`User ${userId} bought ${item.code} for ${item.price} coins`);
            return result;
        });
    }

    /**
     * Get user's inventory
     */
    async getInventory(userId: string) {
        return this.prisma.userInventory.findMany({
            where: { userId },
            include: { item: true },
        });
    }
}
