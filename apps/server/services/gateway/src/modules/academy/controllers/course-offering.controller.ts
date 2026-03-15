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
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  Public,
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  ZodValidationPipe,
  successResponse,
  ReqWithRequester,
} from '@server/shared';
import {
  AcademyCourseOfferingCreateDTO,
  AcademyCourseOfferingQueryDTO,
  AcademyCourseOfferingSetClassesDTO,
  AcademyCourseOfferingUpdateDTO,
  academyCourseOfferingCreateDTOSchema,
  academyCourseOfferingQueryDTOSchema,
  academyCourseOfferingSetClassesDTOSchema,
  academyCourseOfferingUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/course-offerings')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CourseOfferingController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

  @Public()
  @Get('public')
  async findAllPublic(
    @Query(new ZodValidationPipe(academyCourseOfferingQueryDTOSchema))
    query: AcademyCourseOfferingQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.findAll' }, { ...query, status: 'PUBLISHED' }),
    );
    return successResponse({ items });
  }

  @Public()
  @Get('public/:id')
  async findPublicById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.findPublicById' }, { id }),
    );
    return successResponse({ item });
  }

  @Get()
  @Permissions('academy.commerce.read')
  async findAll(
    @Query(new ZodValidationPipe(academyCourseOfferingQueryDTOSchema))
    query: AcademyCourseOfferingQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.commerce.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.commerce.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyCourseOfferingCreateDTOSchema))
    dto: AcademyCourseOfferingCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.create' }, { ...dto, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.commerce.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyCourseOfferingUpdateDTOSchema))
    dto: AcademyCourseOfferingUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.update' }, { id, input: dto, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/set-classes')
  @Permissions('academy.commerce.write')
  async setClasses(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyCourseOfferingSetClassesDTOSchema))
    dto: AcademyCourseOfferingSetClassesDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseOffering.setClasses' },
        { offeringId: id, classIds: dto.classIds, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/archive')
  @Permissions('academy.commerce.write')
  async archive(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.archive' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.commerce.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.delete' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse(result);
  }

  @Post(':id/submit-for-approval')
  @Permissions('academy.commerce.write')
  async submitForApproval(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.submitForApproval' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/approve')
  @Permissions('academy.commerce.approve')
  async approve(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.approve' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/reject')
  @Permissions('academy.commerce.approve')
  async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { reason: string },
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseOffering.reject' },
        { id, reason: body.reason, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Get('selection/classes')
  @Permissions('academy.commerce.read')
  async findClassesForSelection(
    @Query() query: { mode?: string; q?: string },
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.findAll' }, {
        mode: query.mode,
        q: query.q,
        status: 'PUBLISHED,OPENING,ENROLLING,ONGOING',
      }),
    );
    return successResponse({ items });
  }
}

