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
    Logger,
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
import {
    OrderResponseDTO,
    OrderQueryDTO,
    OrderCreateDTO,
    OrderConfirmDTO,
    PaymentQueryDTO,
    PaginatedApiResponse,
} from '@workspace/schemas';

@Controller('api/orders')
@UseGuards(GatewayAuthGuard)
export class OrderController {
    private readonly logger = new Logger(OrderController.name);
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('list')
    async findAll(@Body() query: OrderQueryDTO) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch orders');
        }
    }

    @Get('transactions')
    async findAllPayments(@Query() query: PaymentQueryDTO) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.findAllPayments' },
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
                    { cmd: 'billing.order.findOne' },
                    { id }
                )
            );
            return successResponse({ order: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch order');
        }
    }

    @Get('wallet/balance-history')
    async getBalanceHistory(@Req() req: ReqWithRequester, @Query() query: any) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.user_balance.getHistory' },
                    { ...query, userId: requester.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            this.logger.error(`Failed to fetch balance history for user ${req.requester?.sub}`, error.stack);
            return errorResponse(error.message || 'Failed to fetch balance history');
        }
    }

    @Get('wallet/balance')
    async getBalance(@Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const balance = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.user_balance.get' },
                    { userId: requester.sub }
                )
            );
            return successResponse({ balance });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch balance');
        }
    }

    @Post()
    async create(@Body() input: OrderCreateDTO, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.create' },
                    { ...input, userId: requester.sub, userRole: requester.role }
                )
            );
            return successResponse({ order: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create order');
        }
    }

    @Post(':id/confirm')
    async confirm(@Param('id') id: string, @Body() input: OrderConfirmDTO) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.confirm' },
                    { id, input }
                )
            );
            return successResponse({ order: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to confirm order');
        }
    }

    @Post(':id/cancel')
    async cancel(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.cancel' },
                    { id, userId: requester.sub, userRole: requester.role }
                )
            );
            return successResponse({ order: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to cancel order');
        }
    }
}
