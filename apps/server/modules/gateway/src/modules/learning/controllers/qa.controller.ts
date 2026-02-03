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

@Controller('api/qa')
@UseGuards(GatewayAuthGuard)
export class QAController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Public()
    @Get()
    async findAll(@Query() query: any, @Req() req: Request) {
        try {
            const user = (req as any).user;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'qa.findAll',
                    { query, userId: user?.sub || user?.uid }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch QAs');
        }
    }

    @Public()
    @Get(':id')
    async findById(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = (req as any).user;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'qa.findById',
                    { id, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch QA');
        }
    }

    @Post()
    async create(@Body() dto: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'qa.create',
                    { dto, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result, 'QA created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create QA');
        }
    }

    @Post(':id/like')
    async toggleLike(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    'qa.toggleLike',
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
                    'qa.delete',
                    { id, userId: user?.sub || user?.uid }
                )
            );
            return successResponse(result, 'QA deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete QA');
        }
    }
}
