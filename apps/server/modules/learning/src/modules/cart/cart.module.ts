import { Module } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { CourseMasterModule } from '../course-master/course-master.module';

@Module({
    imports: [CourseMasterModule], // To access CourseMasterRepository
    providers: [CartService, CartRepository, PrismaService],
    exports: [CartService],
})
export class CartModule { }
