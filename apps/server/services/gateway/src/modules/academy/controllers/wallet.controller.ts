import {
  Controller,
  Get,
  Query,
  UseGuards,
  Inject,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  PermissionsGuard,
  successResponse,
  successPaginatedResponse,
  ReqWithRequester,
} from '@server/shared';

@Controller('api/academy/wallet')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class WalletController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Get('balance')
  async getBalance(@Req() req: ReqWithRequester) {
    const requester = req.requester;
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'academy.wallet.getBalance' },
        { userId: requester.sub },
      ),
    );
    return successResponse(result);
  }

  @Get('transactions')
  async getTransactions(
    @Query() query: any,
    @Req() req: ReqWithRequester,
  ) {
    const requester = req.requester;
    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'academy.wallet.getTransactions' },
        { userId: requester.sub, query },
      ),
    );
    return successPaginatedResponse(result);
  }
}
