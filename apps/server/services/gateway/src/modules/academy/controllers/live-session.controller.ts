import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UnauthorizedException,
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
  ZodValidationPipe,
  successResponse,
} from '@server/shared';
import {
  AcademyLiveSessionQueryDTO,
  academyLiveSessionQueryDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/live-sessions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AcademyLiveSessionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(academyLiveSessionQueryDTOSchema))
    query: AcademyLiveSessionQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveSession.findAllByClassAndRange' },
        query,
      ),
    );
    return successResponse({ items });
  }
}

@Controller('api/live-sessions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LiveSessionJoinController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Post(':sessionId/join/lecturer')
  @Permissions('academy.delivery.write')
  async joinAsLecturer(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Req() req: ReqWithRequester,
  ) {
    const userId = req.requester?.sub;
    if (!userId)
      throw new UnauthorizedException('User ID not found in request');

    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveSession.joinBySessionId' },
        { sessionId, userId, isAdmin: true },
      ),
    );
    return successResponse(result);
  }

  @Post(':sessionId/join/student')
  @Permissions('academy.delivery.read')
  async joinAsStudent(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Req() req: ReqWithRequester,
  ) {
    const userId = req.requester?.sub;
    if (!userId)
      throw new UnauthorizedException('User ID not found in request');

    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveSession.joinBySessionId' },
        { sessionId, userId, isAdmin: false },
      ),
    );
    return successResponse(result);
  }
}
