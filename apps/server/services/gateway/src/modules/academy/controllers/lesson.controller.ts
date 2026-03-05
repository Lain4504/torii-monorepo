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
  AcademyLessonCreateDto,
  academyLessonCreateSchema,
  AcademyLessonQueryDto,
  academyLessonQuerySchema,
  AcademyLessonUpdateDto,
  academyLessonUpdateSchema,
} from '@workspace/schemas';

@Controller('api/academy/lessons')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LessonController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.content.read')
  async findAll(
    @Query(new ZodValidationPipe(academyLessonQuerySchema))
    query: AcademyLessonQueryDto,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.lesson.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.lesson.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.content.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyLessonCreateSchema))
    dto: AcademyLessonCreateDto,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.lesson.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyLessonUpdateSchema))
    dto: AcademyLessonUpdateDto,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.lesson.update' }, { id, input: dto }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.content.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.lesson.delete' }, { id }),
    );
    return successResponse(result);
  }
}
