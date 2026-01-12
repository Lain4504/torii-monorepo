
import {
    Controller,
    Post,
    Body,
    Inject,
    HttpCode,
    HttpStatus,
    Headers as RequestHeaders,
} from '@nestjs/common';
import { Public } from '@server/shared';
import type { IOrderService } from '../interfaces/services';
import { ORDER_SERVICE_TOKEN } from '../interfaces/services';

@Controller('sepay')
export class SepayController {
    constructor(@Inject(ORDER_SERVICE_TOKEN) private readonly orderService: IOrderService) { }

    /**
     * Handle SePay Webhook
     */
    @Post('webhook')
    @Public()
    @HttpCode(HttpStatus.OK)
    async handleSePayWebhook(
        @Body() webhookData: any,
        @RequestHeaders('authorization') authHeader: string,
    ): Promise<any> {
        return this.orderService.handleWebhook(webhookData, authHeader);
    }
}
