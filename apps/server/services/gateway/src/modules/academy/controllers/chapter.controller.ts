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
  AcademyChapterCreateDTO,
  AcademyChapterQueryDTO,
  AcademyChapterUpdateDTO,
  academyChapterCreateDTOSchema,
  academyChapterQueryDTOSchema,
  academyChapterUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/chapters')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ChapterController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.content.read')
  async findAll(
    @Query(new ZodValidationPipe(academyChapterQueryDTOSchema))
    query: AcademyChapterQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.chapter.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.chapter.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.content.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyChapterCreateDTOSchema))
    dto: AcademyChapterCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.chapter.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyChapterUpdateDTOSchema))
    dto: AcademyChapterUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.chapter.update' }, { id, input: dto }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.content.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.chapter.delete' }, { id }),
    );
    return successResponse(result);
  }
}

