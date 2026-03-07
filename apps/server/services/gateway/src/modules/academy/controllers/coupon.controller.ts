import {
    Body,
    Controller,
    Inject,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    successResponse,
    Permissions,
    PermissionsGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/academy/coupons')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CouponController {
    constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

    // ===================== USER ENDPOINTS =====================

    /**
     * Validate a coupon code
     */
    @Post('validate')
    async validate(@Body() body: any) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.coupon.validate' }, body),
        );
        return successResponse(result);
    }

    /**
     * Get user's owned coupons
     */
    @Get('my-coupons')
    async getMyCoupons(@Req() req: ReqWithRequester) {
        const userId = req.requester.sub;
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.coupon.getMyCoupons' }, { userId }),
        );
        return successResponse(result);
    }

    // ===================== ADMIN ENDPOINTS =====================

    @Get('admin')
    @Permissions('academy:coupon:admin')
    async findAll() {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.coupon.admin.findAll' }, {}),
        );
        return successResponse(result);
    }

    @Get('admin/:id')
    @Permissions('academy:coupon:admin')
    async findOne(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.coupon.admin.findOne' }, { id }),
        );
        return successResponse(result);
    }

    @Post('admin')
    @Permissions('academy:coupon:admin')
    async create(@Body() body: any) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.coupon.admin.create' }, body),
        );
        return successResponse(result);
    }

    @Patch('admin/:id')
    @Permissions('academy:coupon:admin')
    async update(@Param('id') id: string, @Body() body: any) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.coupon.admin.update' }, { id, data: body }),
        );
        return successResponse(result);
    }

    @Delete('admin/:id')
    @Permissions('academy:coupon:admin')
    async delete(@Param('id') id: string) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.coupon.admin.delete' }, { id }),
        );
        return successResponse(result);
    }
}
