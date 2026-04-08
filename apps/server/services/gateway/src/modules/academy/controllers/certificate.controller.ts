import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  Public,
  ReqWithRequester,
  ZodValidationPipe,
  successPaginatedResponse,
  successResponse,
} from '@server/shared';
import { certificateQueryDTOSchema } from '@workspace/schemas';

@Controller('api/certificates')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CertificateController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('lms.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(certificateQueryDTOSchema)) query: any,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.certificate.findAll' }, query),
    );
    return successPaginatedResponse(result);
  }

  @Get('me')
  async findMine(@Req() req: ReqWithRequester, @Query() query: any) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.certificate.findAll' },
        { ...query, userId: req.requester?.sub },
      ),
    );
    return successPaginatedResponse(result);
  }

  @Get('verify/:code')
  @Public()
  async verify(@Param('code') code: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.certificate.verify' }, { code }),
    );
    return successResponse(result);
  }

  @Get(':id')
  @Permissions('lms.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.certificate.findById' }, { id }),
    );
    return successResponse(result);
  }
}
