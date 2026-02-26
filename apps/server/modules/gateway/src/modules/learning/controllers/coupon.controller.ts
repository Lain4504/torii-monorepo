import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Inject,
    HttpCode,
    HttpStatus,
    Req,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    PermissionsGuard,
    Permissions,
    successResponse,
    successPaginatedResponse,
    Public,
    ReqWithRequester,
} from '@server/shared';
import { CouponSearchRequestDTO } from '@workspace/schemas';

@Controller('api/coupons')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CouponController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    /**
     * Search coupons with pagination and filtering
     * POST /api/coupons/search
     */
    @Post('search')
    @Permissions('coupon.manage')
    async findAll(@Body() dto: CouponSearchRequestDTO) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.coupon.findAll' }, dto)
        );
        return successPaginatedResponse(result);
    }

    /**
     * Get coupon by ID
     * GET /api/coupons/:id
     */
    @Get(':id')
    @Permissions('coupon.manage')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.coupon.findById' }, { id })
        );
        return successResponse({ coupon: result });
    }

    /**
     * Get coupon by code
     * GET /api/coupons/code/:code
     */
    @Get('code/:code')
    @Public()
    async findByCode(@Param('code') code: string) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.coupon.findByCode' }, { code })
        );
        return successResponse({ coupon: result });
    }

    /**
     * Create a new coupon
     * POST /api/coupons
     */
    @Post()
    @Permissions('coupon.manage')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: any, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.coupon.create' },
                { ...dto, userId: requester.sub, userRole: requester.role }
            )
        );
        return successResponse({ coupon: result }, 'Coupon created successfully');
    }

    /**
     * Update coupon
     * PUT /api/coupons/:id
     */
    @Put(':id')
    @Permissions('coupon.manage')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: any,
        @Req() req: ReqWithRequester
    ) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.coupon.update' },
                { id, ...dto, userId: requester.sub, userRole: requester.role }
            )
        );
        return successResponse({ coupon: result }, 'Coupon updated successfully');
    }

    /**
     * Delete coupon (soft delete)
     * DELETE /api/coupons/:id
     */
    @Delete(':id')
    @Permissions('coupon.manage')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: ReqWithRequester) {
        const requester = req.requester;
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.coupon.delete' },
                { id, userId: requester.sub, userRole: requester.role }
            )
        );
        return successResponse(result, 'Coupon deleted successfully');
    }

    /**
     * Validate coupon for a course
     * POST /api/coupons/validate
     */
    @Post('validate')
    @Public()
    async validate(@Body() dto: { code: string; courseId: string; userId?: string }) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.coupon.validate' }, dto)
        );
        return successResponse(result);
    }

    /**
     * Calculate discount amount
     * POST /api/coupons/calculate-discount
     */
    @Post('calculate-discount')
    @Public()
    async calculateDiscount(@Body() dto: { couponId: string; courseId: string; basePrice: number }) {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.coupon.calculateDiscount' }, dto)
        );
        return successResponse(result);
    }

    /**
     * Get coupon statistics
     * GET /api/coupons/statistics
     */
    @Get('statistics')
    @Permissions('coupon.manage')
    async getStatistics() {
        const result = await firstValueFrom(
            this.natsClient.send({ cmd: 'learning.coupon.getStatistics' }, {})
        );
        return successResponse({ statistics: result });
    }

    /**
     * Get available coupons for a course
     * GET /api/coupons/available/:courseId
     */
    @Get('available/:courseId')
    @Public()
    async getAvailableCoupons(@Param('courseId', ParseUUIDPipe) courseId: string) {
        const result = await firstValueFrom(
            this.natsClient.send(
                { cmd: 'learning.coupon.getAvailableCoupons' },
                { courseId }
            )
        );
        return successResponse({ coupons: result });
    }
}
