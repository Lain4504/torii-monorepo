import {
  Controller,
  Inject,
  UnauthorizedException,
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
  Permissions,
  PermissionsGuard,
  ReqWithRequester,
  successResponse,
} from '@server/shared';

@Controller('api/live-sessions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LiveSessionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Post(':id/join/lecturer')
  @Permissions('academy.delivery.write')
  async joinAsLecturer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const userId = req.requester?.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveSession.join' },
        { id, userId, isAdmin: true },
      ),
    );
    return successResponse(result);
  }

  @Post(':id/join')
  @Permissions('academy.delivery.read')
  async joinAsStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const userId = req.requester?.sub;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveSession.join' },
        { id, userId, isAdmin: false },
      ),
    );
    return successResponse(result);
  }
}

