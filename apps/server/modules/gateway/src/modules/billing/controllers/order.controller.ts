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
    Permissions,
    PermissionsGuard,
    ZodValidationPipe,
} from '@server/shared';
import {
    OrderResponseDTO,
    OrderQueryDTO,
    OrderCreateDTO,
    OrderConfirmDTO,
    PaymentQueryDTO,
    PaginatedApiResponse,
    OrderSearchRequestDTO,
    orderSearchRequestDTOSchema,
    PaymentSearchRequestDTO,
    paymentSearchRequestDTOSchema,
} from '@workspace/schemas';

@Controller('api/orders')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class OrderController {
    private readonly logger = new Logger(OrderController.name);
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('search')
    @Permissions('payment.view')
    async searchOrders(@Body(new ZodValidationPipe(orderSearchRequestDTOSchema)) dto: OrderSearchRequestDTO) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.findAll' },
                    dto
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to search orders');
        }
    }

    @Get()
    async findMyOrders(@Query() query: OrderQueryDTO, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            // Force userId to requester's sub so users only see their own orders
            const userQuery = { ...query, userId: requester.sub };
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.findAll' },
                    userQuery
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch your orders');
        }
    }

    @Post('transactions/search')
    @Permissions('payment.view')
    async searchPayments(@Body(new ZodValidationPipe(paymentSearchRequestDTOSchema)) dto: PaymentSearchRequestDTO) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.findAllPayments' },
                    dto
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to search payments');
        }
    }

    @Get('stats')
    @Permissions('payment.view')
    async getStats(@Query() query: OrderQueryDTO) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.getStats' },
                    query
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch order statistics');
        }
    }

    @Get('transactions')
    async findMyPayments(@Query() query: PaymentQueryDTO, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            // Force userId to requester.sub
            const userQuery = { ...query, userId: requester.sub };
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'billing.order.findAllPayments' },
                    userQuery
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch your payments');
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
