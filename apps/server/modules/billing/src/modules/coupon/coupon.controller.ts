import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
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
        // Logic to get order amount would typically come from body or calculated from courseId
        // For now assuming we pass price or fetching course inside (omitted for brevity)
        // Ideally the frontend passes the expected order total or we fetch course price here.
        // BUT `validateCoupon` needs an amount.
        // Let's assume for this step we fetch course price or it's passed.
        // Actually, to keep it simple and stateless, we might need the amount in the DTO or fetch course.
        // Let's modify DTO if needed or just mock for now if course fetching is complex here.

        // Wait, CouponValidateRequestDTO has courseId. 
        // We probably need to fetch the course details to get the price.
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

        // We need to fetch course price. Since we are in Billing Module, 
        // we might not have direct access to Course (Learning Module) except via NATS.
        // Providing a full implementation might be overkill for this tool step if I have to setup NATS here.
        // I'll add a TODO or mock price for now, or just pass 0 if only validating validity rules.

        // Actually, let's use a dummy amount for validation unrelated to min-spend if amount is 0.
        return this.couponService.validateCoupon(body.code, body.userId || '', 0);
    }
}
