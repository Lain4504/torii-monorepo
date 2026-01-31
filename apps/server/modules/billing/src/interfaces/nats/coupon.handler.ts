import { Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CouponService } from '../../modules/coupon/coupon.service';
import { CouponValidateRequestDTO } from '@workspace/schemas';

@Controller()
export class CouponHandler {
    private readonly logger = new Logger(CouponHandler.name);

    constructor(
        private readonly couponService: CouponService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @MessagePattern({ cmd: 'billing.coupon.validate' })
    async validate(@Payload() data: CouponValidateRequestDTO) {
        this.logger.log(`[CouponHandler] Received validation request for code: ${data.code}, userId: ${data.userId}, courseId: ${data.courseId}`);

        let orderAmount = 0;
        if (data.courseId) {
            try {
                const course = await lastValueFrom(
                    this.natsClient.send({ cmd: 'learning.course.findOne' }, { id: data.courseId })
                );
                if (course && course.price) {
                    orderAmount = Number(course.price);
                }
            } catch (error: any) {
                this.logger.warn(`[CouponHandler] Failed to fetch course ${data.courseId}: ${error.message}`);
            }
        }

        try {
            const result = await this.couponService.validateCoupon(
                data.code,
                data.userId || '',
                orderAmount
            );
            this.logger.log(`[CouponHandler] Validation result: ${JSON.stringify(result)}`);
            return result;
        } catch (error: any) {
            this.logger.error(`[CouponHandler] Validation error: ${error.message}`, error.stack);
            throw error;
        }
    }
}
