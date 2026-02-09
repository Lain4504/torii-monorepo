import {
    Controller,
    Get,
    Post,
    Patch,
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
    Public,
    GatewayAuthGuard,
} from '@server/shared';
import { Request } from 'express';

@Controller('api/feed')
@UseGuards(GatewayAuthGuard)
export class FeedController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Public()
    @Get()
    async findAll(@Query() query: any, @Req() req: Request) {
        try {
            const user = (req as any).user;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'feed.findAll',
                    { query, userId: user?.sub || user?.uid }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch Feeds');
        }
    }

    @Public()
    @Get(':id')
    async findById(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = (req as any).user;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'feed.findById',
                    { id, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch Feed');
        }
    }

    @Post()
    async create(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'feed.create',
                    { dto, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result, 'Feed created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create Feed');
        }
    }

    @Post(':id/like')
    async toggleLike(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'feed.toggleLike',
                    { id, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result, 'Like toggled successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to toggle like');
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'feed.delete',
                    { id, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result, 'Feed deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete Feed');
        }
    }
}
