import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CourseRepository } from '../course/course.repository'; // Assuming this exists from Course module
import { PrismaService } from '@server/shared';

@Injectable()
export class CartService {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly courseRepository: CourseRepository, // To validate course
        private readonly prisma: PrismaService,
    ) { }

    async getCart(userId: string) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            // Return empty cart structure if not created yet
            return { items: [], total: 0, count: 0 };
        }

        const totalPrice = cart.items.reduce((sum, item) => {
            const price = item.course.discountPrice ? Number(item.course.discountPrice) : Number(item.course.price);
            return sum + price;
        }, 0);

        return {
            id: cart.id,
            items: cart.items.map(item => ({
                ...item,
                course: {
                    id: item.course.id,
                    title: item.course.title,
                    slug: item.course.slug,
                    thumbnailUrl: item.course.thumbnailUrl,
                    price: Number(item.course.price),
                    discountPrice: item.course.discountPrice ? Number(item.course.discountPrice) : null,
                    instructor: 'Instructor Name', // Placeholder or fetch
                }
            })),
            total: totalPrice,
            count: cart.items.length,
        };
    }

    async addToCart(userId: string, courseId: string) {
        // 1. Validate Course
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new NotFoundException('Course not found');
        }
        
        if (course.status !== 'published') {
            throw new BadRequestException('Cannot add unpublished course to cart');
        }

        // 2. Get or Create Cart
        const cart = await this.cartRepository.findOrCreate(userId);

        // 3. Check if already in cart
        const existingItem = await this.cartRepository.getItem(cart.id, courseId);
        if (existingItem) {
            throw new BadRequestException('Course is already in cart');
        }

        // 4. Check if already enrolled (Optional, but good UX)
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                }
            }
        });
        if (enrollment) {
            throw new BadRequestException('You are already enrolled in this course');
        }

        // 5. Add Item
        await this.cartRepository.addItem(cart.id, courseId);

        return this.getCart(userId);
    }

    async removeFromCart(userId: string, courseId: string) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        await this.cartRepository.removeItem(cart.id, courseId);
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
