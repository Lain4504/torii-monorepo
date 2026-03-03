import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import {
    type CouponValidateRequestDTO,
    type CouponValidateResponseDTO
} from '@workspace/schemas';

@Controller('coupons')
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    @Post('validate')
    async validate(@Body() body: CouponValidateRequestDTO): Promise<CouponValidateResponseDTO> {
        // We need to fetch course price via NATS from Learning Module if we want to validate minSpend.
        // For now, we perform basic validity checks (expiry, status, user usage).
        // Or we can rely on `OrderService` for the actual logic.
        // But this is a public/user-facing validation endpoint.

        // Let's leave amount as 0 and rely on backend fetching in a real scenario,
        // or assumes the client sends it? 
        // The DTO definition in schema:
        /*
        export const couponValidateRequestDTOSchema = z.object({
          code: z.string().min(1),
          courseId: z.string().uuid(),
          userId: z.string().uuid().optional(),
        });
        */

        // Basic validation without course price for now. 
        return this.couponService.validateCoupon(body.code, body.userId || '', 0);
    }

    @Get('my-coupons')
    async getCoupons(@Query('userId') userId: string) {
        if (!userId) {
            return [];
        }
        return this.couponService.getCouponsForUser(userId);
    }
}
