import {
    Controller,
    Post,
    Body,
    Req,
    UseGuards,
    Inject,
    Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';
import { CouponValidateRequestDTO } from '@workspace/schemas';

@Controller('api/billing/coupons')
export class CouponController {
    private readonly logger = new Logger(CouponController.name);

    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('validate')
    @UseGuards(GatewayAuthGuard)
    async validate(@Body() input: CouponValidateRequestDTO, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            // Ensure userId is passed from auth token if not in body
            const payload = {
                ...input,
                userId: requester.sub,
            };

            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.coupon.validate' },
                    payload
                )
            );
            return successResponse({
                isValid: result.isValid,
                message: result.message,
                coupon: result.coupon,
                discountAmount: result.discountAmount
            });
        } catch (error: any) {
            // If service throws error, return it as success=false or error response
            // Coupon validation usually returns success=true/false in isValid field,
            // but if it throws exception, we catch here.
            return errorResponse(error.message || 'Failed to validate coupon');
        }
    }
}
