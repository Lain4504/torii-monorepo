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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    successResponse,
    Permissions,
    PermissionsGuard,
} from '@server/shared';

@Controller('api/academy/coupons')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CouponController {
    constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

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
