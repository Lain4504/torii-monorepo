import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CourseMasterRepository } from '../course-master/course-master.repository'; // Assuming this exists from Course module
import { PrismaService } from '@server/shared';

import { COURSE_MASTER_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { ICourseMasterRepository } from '@server/learning/interfaces/repositories';

@Injectable()
export class CartService {
    constructor(
        private readonly cartRepository: CartRepository,
        @Inject(COURSE_MASTER_REPOSITORY_TOKEN) private readonly courseMasterRepository: ICourseMasterRepository, // To validate course
        private readonly prisma: PrismaService,
    ) { }

    async getCart(userId: string) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            // Return empty cart structure if not created yet
            return { items: [], total: 0, count: 0 };
        }

        const totalPrice = cart.items.reduce((sum, item) => {
            const run = item.courseRun;
            const price = run.discountPrice ? Number(run.discountPrice) : Number(run.price);
            return sum + price;
        }, 0);

        return {
            id: cart.id,
            items: cart.items.map(item => {
                const run = item.courseRun;
                const master = run.courseMaster;
                return {
                    ...item,
                    courseRunId: run.id,
                    course: {
                        id: master.id,
                        title: master.title,
                        slug: master.slug,
                        thumbnailUrl: master.thumbnailUrl,
                        price: Number(run.price),
                        discountPrice: run.discountPrice ? Number(run.discountPrice) : null,
                        instructor: 'Instructor Name', // Placeholder or fetch
                    }
                };
            }),
            total: totalPrice,
            count: cart.items.length,
        };
    }

    async addToCart(userId: string, courseRunId: string) {
        // 1. Validate Course Run
        const courseRun = await this.prisma.courseRun.findUnique({
            where: { id: courseRunId },
            include: { courseMaster: true }
        });
        if (!courseRun) {
            throw new NotFoundException('Course run not found');
        }

        const master = courseRun.courseMaster;
        if (master?.status !== 'published') {
            throw new BadRequestException('Cannot add run of unpublished course to cart');
        }

        // 2. Get or Create Cart
        const cart = await this.cartRepository.findOrCreate(userId);

        // 3. Check if already in cart
        const existingItem = await this.cartRepository.getItem(cart.id, courseRunId);
        if (existingItem) {
            throw new BadRequestException('Course run is already in cart');
        }

        // 4. Check if already enrolled
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseRunId: {
                    userId,
                    courseRunId,
                }
            }
        });
        if (enrollment) {
            throw new BadRequestException('You are already enrolled in this course run');
        }

        // 5. Add Item
        await this.cartRepository.addItem(cart.id, courseRunId);

        return this.getCart(userId);
    }

    async removeFromCart(userId: string, courseRunId: string) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        await this.cartRepository.removeItem(cart.id, courseRunId);
        return this.getCart(userId);
    }

    async clearCart(userId: string) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (cart) {
            await this.cartRepository.clearCart(cart.id);
        }
        return { items: [], total: 0, count: 0 };
    }
}
