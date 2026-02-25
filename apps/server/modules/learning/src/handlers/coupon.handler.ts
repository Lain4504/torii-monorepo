import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COUPON_SERVICE_TOKEN, ICouponService } from '@server/learning/interfaces/services';
import {
    CouponCreateDTO,
    CouponUpdateDTO,
    CouponValidateRequestDTO,
    CouponCalculateDiscountRequestDTO,
    CouponSearchRequestDTO,
    Requester,
} from '@workspace/schemas';

@Controller()
export class CouponHandler {
    constructor(
        @Inject(COUPON_SERVICE_TOKEN) private readonly couponService: ICouponService
    ) { }

    @MessagePattern({ cmd: 'learning.coupon.findAll' })
    async findAll(@Payload() query: CouponSearchRequestDTO) {
        return this.couponService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.coupon.findOne' })
    async findOne(@Payload() data: { id: string }) {
        return this.couponService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'learning.coupon.findByCode' })
    async findByCode(@Payload() data: { code: string }) {
        return this.couponService.findByCode(data.code);
    }

    @MessagePattern({ cmd: 'learning.coupon.create' })
    async create(@Payload() data: CouponCreateDTO & { userId: string; userRole: string }) {
        const { userId, userRole, ...dto } = data;
        const requester: Requester = { sub: userId, role: userRole as any };
        return this.couponService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.coupon.update' })
    async update(@Payload() data: CouponUpdateDTO & { id: string; userId: string; userRole: string }) {
        const { id, userId, userRole, ...dto } = data;
        const requester: Requester = { sub: userId, role: userRole as any };
        return this.couponService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.coupon.delete' })
    async delete(@Payload() data: { id: string; userId: string; userRole: string }) {
        const { id, userId, userRole } = data;
        const requester: Requester = { sub: userId, role: userRole as any };
        return this.couponService.delete(requester, id);
    }

    @MessagePattern({ cmd: 'learning.coupon.validate' })
    async validate(@Payload() data: CouponValidateRequestDTO) {
        return this.couponService.validateCoupon(data);
    }

    @MessagePattern({ cmd: 'learning.coupon.calculateDiscount' })
    async calculateDiscount(@Payload() data: CouponCalculateDiscountRequestDTO) {
        return this.couponService.calculateDiscount(data);
    }

    @MessagePattern({ cmd: 'learning.coupon.getStatistics' })
    async getStatistics() {
        return this.couponService.getStatistics();
    }

    @MessagePattern({ cmd: 'learning.coupon.getAvailableCoupons' })
    async getAvailableCoupons(@Payload() data: { courseId: string }) {
        return this.couponService.getAvailableCoupons(data.courseId);
    }
}

