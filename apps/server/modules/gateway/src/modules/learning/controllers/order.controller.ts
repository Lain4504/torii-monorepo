import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
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
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('orders')
@UseGuards(IdentityAuthGuard)
export class OrderController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get()
    async findAll(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.order.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch orders');
        }
    }

    @Get('transactions')
    async findAllPayments(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.order.findAllPayments' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch payments');
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.order.findOne' },
                    { id }
                )
            );
            return successResponse({ order: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch order');
        }
    }

    @Post()
    async create(@Body() input: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.order.create' },
                    { ...input, userId: user.sub }
                )
            );
            return successResponse({ order: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create order');
        }
    }

    @Post(':id/confirm')
    async confirm(@Param('id') id: string, @Body() input: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.order.confirm' },
                    { id, input }
                )
            );
            return successResponse({ order: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to confirm order');
        }
    }
}
