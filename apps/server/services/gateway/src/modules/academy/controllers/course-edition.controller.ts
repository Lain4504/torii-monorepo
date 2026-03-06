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
  AcademyCourseEditionCreateDTO,
  academyCourseEditionCreateDTOSchema,
  AcademyCourseEditionQueryDTO,
  academyCourseEditionQueryDTOSchema,
  AcademyCourseEditionUpdateDTO,
  academyCourseEditionUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/course-editions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CourseEditionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.content.read')
  async findAll(
    @Query(new ZodValidationPipe(academyCourseEditionQueryDTOSchema))
    query: AcademyCourseEditionQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Get('by-course-profile/:courseProfileId')
  @Permissions('academy.content.read')
  async findByCourseProfileId(
    @Param('courseProfileId', new ParseUUIDPipe()) courseProfileId: string,
  ) {
    const items = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseEdition.findByCourseProfileId' },
        { courseProfileId },
      ),
    );
    return successResponse({ items });
  }

  @Post()
  @Permissions('academy.content.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyCourseEditionCreateDTOSchema))
    dto: AcademyCourseEditionCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyCourseEditionUpdateDTOSchema))
    dto: AcademyCourseEditionUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.update' }, { id, input: dto }),
    );
    return successResponse({ item });
  }

  @Post(':id/set-current')
  @Permissions('academy.content.write')
  async setCurrent(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.setCurrent' }, { id }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.content.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.delete' }, { id }),
    );
    return successResponse(result);
  }
}

