import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/carts')
@UseGuards(GatewayAuthGuard)
export class CartController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async getCart(@Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send('cart.get', { userId: requester.sub })
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch cart');
        }
    }

    @Post('items')
    async addToCart(@Body() body: { courseRunId: string }, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send('cart.add', { userId: requester.sub, courseRunId: body.courseRunId })
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to add to cart');
        }
    }

    @Delete('items/:courseRunId')
    async removeFromCart(@Param('courseRunId') courseRunId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send('cart.remove', { userId: requester.sub, courseRunId })
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to remove from cart');
        }
    }

    @Delete()
    async clearCart(@Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send('cart.clear', { userId: requester.sub })
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to clear cart');
        }
    }
}
