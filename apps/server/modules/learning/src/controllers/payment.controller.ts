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
} from '@nestjs/common';
import { GatewayAuthGuard } from '@server/shared';
import type {
    PaymentResponseDTO,
    PaymentCreateDTO,
    PaymentQueryDTO,
    PaymentConfirmDTO,
    PaginatedResponseDTO,
    ReqWithRequester,
} from '@workspace/schemas';
import type { IPaymentService } from '../interfaces/services';
import { PAYMENT_SERVICE_TOKEN } from '../interfaces/services';

/**
 * Payment HTTP Controller
 * Handles payment operations
 */
@Controller('payments')
@UseGuards(GatewayAuthGuard)
export class PaymentController {
    constructor(@Inject(PAYMENT_SERVICE_TOKEN) private readonly paymentService: IPaymentService) { }

    /**
     * Get all payments with pagination
     */
    @Get()
    async findAll(@Query() query: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>> {
        return this.paymentService.findAll(query);
    }

    /**
     * Get payment by ID
     */
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentResponseDTO | null> {
        return this.paymentService.findOne(id);
    }

    /**
     * Create new payment (mock)
     */
    @Post()
    async create(
        @Request() req: ReqWithRequester,
        @Body() input: PaymentCreateDTO,
    ): Promise<PaymentResponseDTO> {
        const userId = req.requester.sub;
        return this.paymentService.create(userId, input);
    }

    /**
     * Confirm/complete payment (mock)
     */
    @Post(':id/confirm')
    async confirm(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() input: PaymentConfirmDTO,
    ): Promise<PaymentResponseDTO> {
        return this.paymentService.confirm(id, input);
    }
}

