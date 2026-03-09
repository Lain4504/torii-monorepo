import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
  ReqWithRequester,
  ZodValidationPipe,
  successResponse,
} from '@server/shared';
import {
  AcademyLiveScheduleConflictPreviewDTO,
  AcademyLiveScheduleCreateDTO,
  AcademyLiveScheduleQueryDTO,
  AcademyLiveScheduleRequestApproveDTO,
  AcademyLiveScheduleRequestCreateDTO,
  AcademyLiveScheduleRequestQueryDTO,
  AcademyLiveScheduleRequestRejectDTO,
  AcademyLiveScheduleUpdateDTO,
  academyLiveScheduleConflictPreviewDTOSchema,
  academyLiveScheduleCreateDTOSchema,
  academyLiveScheduleQueryDTOSchema,
  academyLiveScheduleRequestApproveDTOSchema,
  academyLiveScheduleRequestCreateDTOSchema,
  academyLiveScheduleRequestQueryDTOSchema,
  academyLiveScheduleRequestRejectDTOSchema,
  academyLiveScheduleUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/live-schedules')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LiveScheduleController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

  @Get()
  @Permissions('academy.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(academyLiveScheduleQueryDTOSchema))
    query: AcademyLiveScheduleQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveSchedule.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveSchedule.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.delivery.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: ReqWithRequester,
    @Body(new ZodValidationPipe(academyLiveScheduleCreateDTOSchema))
    dto: AcademyLiveScheduleCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveSchedule.create' }, {
        ...dto,
        requesterId: req.requester.sub,
      }),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.delivery.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
    @Body(new ZodValidationPipe(academyLiveScheduleUpdateDTOSchema))
    dto: AcademyLiveScheduleUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveSchedule.update' },
        { id, input: dto, requesterId: req.requester.sub },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveSchedule.delete' }, {
        id,
        requesterId: req.requester.sub,
      }),
    );
    return successResponse(result);
  }

  @Post('preview-conflict')
  @Permissions('academy.delivery.write')
  async previewConflict(
    @Body(new ZodValidationPipe(academyLiveScheduleConflictPreviewDTOSchema))
    dto: AcademyLiveScheduleConflictPreviewDTO,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveSchedule.previewConflict' }, dto),
    );
    return successResponse(result);
  }

  @Get('/requests/list')
  @Permissions('academy.delivery.read')
  async findAllRequests(
    @Query(new ZodValidationPipe(academyLiveScheduleRequestQueryDTOSchema))
    query: AcademyLiveScheduleRequestQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveScheduleRequest.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Post('/requests')
  @Permissions('academy.delivery.write')
  @HttpCode(HttpStatus.CREATED)
  async createRequest(
    @Req() req: ReqWithRequester,
    @Body(new ZodValidationPipe(academyLiveScheduleRequestCreateDTOSchema))
    dto: AcademyLiveScheduleRequestCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveScheduleRequest.create' }, {
        ...dto,
        requesterId: req.requester.sub,
      }),
    );
    return successResponse({ item });
  }

  @Post('/requests/:id/cancel')
  @Permissions('academy.delivery.write')
  async cancelRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveScheduleRequest.cancel' }, {
        id,
        requesterId: req.requester.sub,
      }),
    );
    return successResponse({ item });
  }

  @Post('/requests/:id/approve')
  @Permissions('academy.delivery.approve')
  async approveRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
    @Body(new ZodValidationPipe(academyLiveScheduleRequestApproveDTOSchema))
    dto: AcademyLiveScheduleRequestApproveDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveScheduleRequest.approve' }, {
        id,
        input: dto,
        reviewerId: req.requester.sub,
      }),
    );
    return successResponse({ item });
  }

  @Post('/requests/:id/reject')
  @Permissions('academy.delivery.approve')
  async rejectRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
    @Body(new ZodValidationPipe(academyLiveScheduleRequestRejectDTOSchema))
    dto: AcademyLiveScheduleRequestRejectDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveScheduleRequest.reject' }, {
        id,
        input: dto,
        reviewerId: req.requester.sub,
      }),
    );
    return successResponse({ item });
  }
}
