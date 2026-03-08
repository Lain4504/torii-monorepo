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
  ZodValidationPipe,
  successResponse,
  ReqWithRequester,
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
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

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
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.chapter.create' }, { ...dto, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyChapterUpdateDTOSchema))
    dto: AcademyChapterUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.chapter.update' }, { id, input: dto, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  async delete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.chapter.delete' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse(result);
  }
}

