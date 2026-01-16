import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    Request,
    Inject,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    Headers as RequestHeaders,
} from '@nestjs/common';
import { GatewayAuthGuard, Public } from '@server/shared';
import type {
    OrderResponseDTO,
    OrderCreateDTO,
    OrderQueryDTO,
    OrderConfirmDTO,
    PaginatedResponseDTO,
    PaymentQueryDTO,
    PaymentResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { IOrderService } from '../interfaces/services';
import { ORDER_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Order HTTP Controller
 * Handles order and payment operations (formerly Payment Controller)
 */
@Controller('orders') // Keeping the route as 'payments' for now to avoid broken FE
@UseGuards(GatewayAuthGuard)
export class OrderController {
    constructor(@Inject(ORDER_SERVICE_TOKEN) private readonly orderService: IOrderService) { }

    /**
     * Get all orders with pagination
     */
    @Get()
    async findAll(@Query() query: OrderQueryDTO): Promise<PaginatedResponseDTO<OrderResponseDTO>> {
        return this.orderService.findAll(query);
    }

    /**
     * Get all payments (transactions) with pagination
     */
    @Get('transactions')
    async findAllPayments(@Query() query: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>> {
        return this.orderService.findAllPayments(query);
    }

    /**
     * Get order by ID
     */
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrderResponseDTO | null> {
        return this.orderService.findOne(id);
    }

    /**
     * Create new order
     */
    @Post()
    async create(
        @Request() req: ReqWithRequester,
        @Body() input: OrderCreateDTO,
    ): Promise<OrderResponseDTO> {
        const userId = req.requester.sub;
        return this.orderService.create(userId, input);
    }



    /**
     * Confirm/complete order
     */
    @Post(':id/confirm')
    async confirm(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: OrderConfirmDTO,
    ): Promise<OrderResponseDTO> {
        return this.orderService.confirm(id, input);
    }
}
