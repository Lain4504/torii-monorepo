import {
  Controller,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  successResponse,
} from '@server/shared';
import { Request } from 'express';

@Controller('api/live-sessions')
@UseGuards(GatewayAuthGuard)
export class LiveSessionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Post(':id/join')
  async join(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveSession.join' }, { id, userId }),
    );
    return successResponse(result);
  }
}
