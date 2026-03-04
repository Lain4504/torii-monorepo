import { Module } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { CourseMasterModule } from '../course-master/course-master.module';
import { CartHandler } from '@server/learning/modules/cart/cart.handler';

@Module({
    imports: [CourseMasterModule],
  controllers: [CartHandler], // To access CourseMasterRepository
    providers: [CartService, CartRepository, PrismaService],
    exports: [CartService],
})
export class CartModule { }
