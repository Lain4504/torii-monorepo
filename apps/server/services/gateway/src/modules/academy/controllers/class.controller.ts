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
  AcademyClassCreateDTO,
  AcademyClassQueryDTO,
  AcademyClassUpdateDTO,
  academyClassCreateDTOSchema,
  academyClassQueryDTOSchema,
  academyClassUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/classes')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ClassController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

  @Get()
  @Permissions('academy.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(academyClassQueryDTOSchema))
    query: AcademyClassQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.delivery.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyClassCreateDTOSchema))
    dto: AcademyClassCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.delivery.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyClassUpdateDTOSchema))
    dto: AcademyClassUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.update' }, { id, input: dto }),
    );
    return successResponse({ item });
  }

  @Get(':id/curriculum')
  @Permissions('academy.delivery.read')
  async getCurriculum(@Param('id', new ParseUUIDPipe()) id: string) {
    const curriculum = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.getCurriculum' }, { id }),
    );
    return successResponse({ curriculum });
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.delete' }, { id }),
    );
    return successResponse(result);
  }
}

