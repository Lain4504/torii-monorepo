import {
    Body,
    Controller,
    Inject,
    Post,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    ZodValidationPipe,
    successResponse,
} from '@server/shared';
import {
    orderCheckoutSchema,
    orderPreviewSchema
} from './order.schema';

@Controller('api/academy/orders')
@UseGuards(GatewayAuthGuard)
export class OrderController {
    constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

    @Post('preview')
    async preview(
        @Body(new ZodValidationPipe(orderPreviewSchema))
        dto: any,
        @Req() req: any
    ) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.order.preview' }, { userId: req.user.id, input: dto }),
        );
        return successResponse(result);
    }

    @Post('checkout')
    async checkout(
        @Body(new ZodValidationPipe(orderCheckoutSchema))
        dto: any,
        @Req() req: any
    ) {
        const result = await firstValueFrom(
            this.nats.send({ cmd: 'academy.order.checkout' }, { userId: req.user.id, input: dto }),
        );
        return successResponse(result);
    }
}
