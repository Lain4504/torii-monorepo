import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  Public,
  ReqWithRequester,
  successResponse,
  ZodValidationPipe,
} from '@server/shared';
import {
  academyCourseEditionCreateDTOSchema,
  academyCourseEditionQueryDTOSchema,
  academyCourseEditionUpdateDTOSchema,
  type AcademyCourseEditionCreateDTO,
  type AcademyCourseEditionQueryDTO,
  type AcademyCourseEditionUpdateDTO,
} from '@workspace/schemas';

@Controller('api/academy/course-editions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CourseEditionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  // Public list for learner side filtering.
  @Public()
  @Get('public')
  async findAllPublic(
    @Query(new ZodValidationPipe(academyCourseEditionQueryDTOSchema))
    query: AcademyCourseEditionQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.findAll' }, query ?? {}),
    );
    return successResponse({ items });
  }

  @Get()
  @Permissions('academy.content.read')
  async findAll(
    @Query(new ZodValidationPipe(academyCourseEditionQueryDTOSchema))
    query: AcademyCourseEditionQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.findAll' }, query ?? {}),
    );
    return successResponse({ items });
  }

  @Post()
  @Permissions('academy.content.write')
  async create(
    @Body(new ZodValidationPipe(academyCourseEditionCreateDTOSchema))
    dto: AcademyCourseEditionCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseEdition.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyCourseEditionUpdateDTOSchema))
    dto: AcademyCourseEditionUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseEdition.update' },
        { id, input: dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseEdition.findById' }, { id }),
    );
    return successResponse({ item });
  }
}
