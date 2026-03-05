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
  AcademyClassScheduleCreateDTO,
  AcademyClassScheduleQueryDTO,
  AcademyClassScheduleUpdateDTO,
  academyClassScheduleCreateDTOSchema,
  academyClassScheduleQueryDTOSchema,
  academyClassScheduleUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/class-schedules')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ClassScheduleController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(academyClassScheduleQueryDTOSchema))
    query: AcademyClassScheduleQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classSchedule.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classSchedule.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.delivery.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyClassScheduleCreateDTOSchema))
    dto: AcademyClassScheduleCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classSchedule.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.delivery.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyClassScheduleUpdateDTOSchema))
    dto: AcademyClassScheduleUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.classSchedule.update' },
        { id, input: dto },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classSchedule.delete' }, { id }),
    );
    return successResponse(result);
  }
}

