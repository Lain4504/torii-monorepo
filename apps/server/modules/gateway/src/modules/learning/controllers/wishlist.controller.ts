import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    successPaginatedResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/wishlists')
@UseGuards(GatewayAuthGuard)
export class WishlistController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch wishlists');
        }
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.findById' },
                    { id }
                )
            );
            return successResponse({ wishlist: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch wishlist');
        }
    }

    @Post()
    async create(@Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.create' },
                    { ...input, userId: requester.sub }
                )
            );
            return successResponse({ wishlist: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create wishlist');
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.delete' },
                    { id }
                )
            );
            return successResponse(null, 'Wishlist item removed');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete wishlist');
        }
    }

    @Post('toggle/:courseRunId')
    async toggle(@Param('courseRunId') courseRunId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.toggle' },
                    { courseRunId, userId: requester.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to toggle wishlist');
        }
    }

    @Get('check/:courseRunId')
    async checkWishlist(@Param('courseRunId') courseRunId: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            if (!requester) return successResponse({ isInWishlist: false });

            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.check' },
                    { courseRunId, userId: requester.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to check wishlist');
        }
    }
}
