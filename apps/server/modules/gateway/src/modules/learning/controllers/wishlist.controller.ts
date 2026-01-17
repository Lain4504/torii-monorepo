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
    successPaginatedResponse
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';
import { Request } from 'express';

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
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.findOne' },
                    { id }
                )
            );
            return successResponse({ wishlist: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch wishlist');
        }
    }

    @Post()
    async create(@Body() input: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.create' },
                    { ...input, userId: user.sub }
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

    @Post('toggle/:courseId')
    async toggle(@Param('courseId') courseId: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.toggle' },
                    { courseId, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to toggle wishlist');
        }
    }

    @Get('check/:courseId')
    async checkWishlist(@Param('courseId') courseId: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            if (!user) return successResponse({ isInWishlist: false });

            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.wishlist.check' },
                    { courseId, userId: user.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to check wishlist');
        }
    }
}
