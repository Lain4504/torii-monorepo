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
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  ZodValidationPipe,
  successResponse,
} from '@server/shared';
import {
  AcademyLiveScheduleCreateDTO,
  AcademyLiveScheduleQueryDTO,
  AcademyLiveScheduleUpdateDTO,
  academyLiveScheduleCreateDTOSchema,
  academyLiveScheduleQueryDTOSchema,
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
    @Body(new ZodValidationPipe(academyLiveScheduleCreateDTOSchema))
    dto: AcademyLiveScheduleCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveSchedule.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.delivery.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyLiveScheduleUpdateDTOSchema))
    dto: AcademyLiveScheduleUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveSchedule.update' },
        { id, input: dto },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveSchedule.delete' }, { id }),
    );
    return successResponse(result);
  }
}
