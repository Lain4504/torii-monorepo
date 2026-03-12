import {
  Body,
  Controller,
  Delete,
  Inject,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
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
  AcademyClassAssignmentUpdateDTO,
  academyClassAssignmentUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/class-assignments')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ClassAssignmentController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Put(':id')
  @Permissions('academy.delivery.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyClassAssignmentUpdateDTOSchema))
    dto: AcademyClassAssignmentUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.updateAssignment' }, {
        id,
        input: dto,
      }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.removeAssignment' }, {
        id,
        requesterId: req.requester?.sub,
      }),
    );
    return successResponse(result);
  }
}
