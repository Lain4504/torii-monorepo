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
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
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
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Post('search')
  @Permissions('payment.view')
  async searchOrders(
    @Body(new ZodValidationPipe(orderSearchRequestDTOSchema))
    dto: OrderSearchRequestDTO,
  ) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'billing.order.findAll' }, dto),
      );
      return successPaginatedResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to search orders');
    }
  }

  @Post('export')
  @Permissions('payment.view')
  async exportOrders(
    @Body(new ZodValidationPipe(orderSearchRequestDTOSchema))
    dto: OrderSearchRequestDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'billing.order.export' }, dto),
      );

      // Generate CSV using exceljs
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      // Define columns
      worksheet.columns = [
        { header: 'ID đơn hàng', key: 'orderId', width: 25 },
        { header: 'Khách hàng', key: 'userName', width: 20 },
        { header: 'Email', key: 'userEmail', width: 25 },
        { header: 'Số tiền', key: 'amount', width: 15 },
        { header: 'Loại thanh toán', key: 'paymentMethod', width: 15 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Loại đơn', key: 'orderType', width: 15 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 },
        { header: 'Ngày hoàn thành', key: 'completedAt', width: 20 },
      ];

      // Map data to worksheet
      const rows = result.map((order: any) => ({
        orderId: order.id,
        userName: order.user?.displayName || 'N/A',
        userEmail: order.user?.email || 'N/A',
        amount: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: order.currency || 'VND',
        }).format(order.amount),
        paymentMethod: order.paymentMethod || 'N/A',
        status: order.status,
        orderType: order.orderType,
        createdAt: order.createdAt
          ? new Date(order.createdAt).toLocaleString('vi-VN')
          : 'N/A',
        completedAt: order.completedAt
          ? new Date(order.completedAt).toLocaleString('vi-VN')
          : 'N/A',
      }));

      worksheet.addRows(rows);

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=orders-export.csv',
      );

      await workbook.csv.write(res);
      res.end();
    } catch (error: any) {
      this.logger.error(
        `Failed to export orders: ${error.message}`,
        error.stack,
      );
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to export orders',
      });
    }
  }

  @Get()
  async findMyOrders(
    @Query() query: OrderQueryDTO,
    @Req() req: ReqWithRequester,
  ) {
    try {
      const requester = req.requester;
      // Force userId to requester's sub so users only see their own orders
      const userQuery = { ...query, userId: requester.sub };
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'billing.order.findAll' }, userQuery),
      );
      return successPaginatedResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch your orders');
    }
  }

  @Post('transactions/search')
  @Permissions('payment.view')
  async searchPayments(
    @Body(new ZodValidationPipe(paymentSearchRequestDTOSchema))
    dto: PaymentSearchRequestDTO,
  ) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'billing.order.findAllPayments' }, dto),
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
        this.natsClient.send({ cmd: 'billing.order.getStats' }, query),
      );
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch order statistics');
    }
  }

  @Get('transactions')
  async findMyPayments(
    @Query() query: PaymentQueryDTO,
    @Req() req: ReqWithRequester,
  ) {
    try {
      const requester = req.requester;
      // Force userId to requester.sub
      const userQuery = { ...query, userId: requester.sub };
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'billing.order.findAllPayments' },
          userQuery,
        ),
      );
      return successPaginatedResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch your payments');
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'billing.order.findById' }, { id }),
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
          { ...query, userId: requester.sub },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch balance history for user ${req.requester?.sub}`,
        error.stack,
      );
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
          { userId: requester.sub },
        ),
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
          { ...input, userId: requester.sub, userRole: requester.role },
        ),
      );
      return successResponse({ order: result });
    } catch (error: any) {
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message || 'Failed to create order');
    }
  }

  @Post(':id/confirm')
  async confirm(@Param('id') id: string, @Body() input: OrderConfirmDTO) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'billing.order.confirm' }, { id, input }),
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
          { id, userId: requester.sub, userRole: requester.role },
        ),
      );
      return successResponse({ order: result });
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to cancel order');
    }
  }
}
