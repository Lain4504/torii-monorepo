import { Module } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { CourseModule } from '../course/course.module';

@Module({
    imports: [CourseModule], // To access CourseRepository
    providers: [CartService, CartRepository, PrismaService],
    exports: [CartService],
})
export class CartModule { }
