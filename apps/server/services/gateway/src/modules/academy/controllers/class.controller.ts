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
  AcademyClassCreateDTO,
  AcademyClassContentItemCreateDTO,
  AcademyClassContentItemUpdateDTO,
  AcademyClassDuplicateDTO,
  AcademyClassModuleCreateDTO,
  AcademyClassModuleUpdateDTO,
  AcademyClassQueryDTO,
  AcademyClassUpdateDTO,
  academyClassCreateDTOSchema,
  academyClassContentItemCreateDTOSchema,
  academyClassContentItemUpdateDTOSchema,
  academyClassDuplicateDTOSchema,
  academyClassModuleCreateDTOSchema,
  academyClassModuleUpdateDTOSchema,
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
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.create' }, { ...dto, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.delivery.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyClassUpdateDTOSchema))
    dto: AcademyClassUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.update' }, { id, input: dto, requesterId: req.requester?.sub }),
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

  @Post(':id/publish')
  @Permissions('academy.delivery.write')
  async publish(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.publish' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/start')
  @Permissions('academy.delivery.write')
  async start(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.start' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/complete')
  @Permissions('academy.delivery.write')
  async complete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.complete' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/cancel')
  @Permissions('academy.delivery.write')
  async cancel(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.cancel' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/submit-for-approval')
  @Permissions('academy.delivery.write')
  async submitForApproval(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.submitForApproval' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/approve')
  @Permissions('academy.delivery.approve')
  async approve(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.approve' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse({ item });
  }

  @Post(':id/reject')
  @Permissions('academy.delivery.approve')
  async reject(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { reason: string },
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.reject' },
        { id, reason: body.reason, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.delete' }, { id, requesterId: req.requester?.sub }),
    );
    return successResponse(result);
  }

  @Post(':id/duplicate')
  @Permissions('academy.delivery.write')
  async duplicate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyClassDuplicateDTOSchema))
    dto: AcademyClassDuplicateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.duplicate' },
        { id, input: dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/modules')
  @Permissions('academy.delivery.write')
  async addModule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyClassModuleCreateDTOSchema))
    dto: AcademyClassModuleCreateDTO,
  ) {
    const module = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.addModule' },
        { classId: id, ...dto },
      ),
    );
    return successResponse({ module });
  }

  @Put('modules/:moduleId')
  @Permissions('academy.delivery.write')
  async updateModule(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Body(new ZodValidationPipe(academyClassModuleUpdateDTOSchema))
    dto: AcademyClassModuleUpdateDTO,
  ) {
    const module = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.updateModule' },
        { id: moduleId, input: dto },
      ),
    );
    return successResponse({ module });
  }

  @Delete('modules/:moduleId')
  @Permissions('academy.delivery.write')
  async deleteModule(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.deleteModule' },
        { id: moduleId },
      ),
    );
    return successResponse(result);
  }

  @Post('modules/:moduleId/items')
  @Permissions('academy.delivery.write')
  async addContentItem(
    @Param('moduleId', new ParseUUIDPipe()) moduleId: string,
    @Body(new ZodValidationPipe(academyClassContentItemCreateDTOSchema))
    dto: AcademyClassContentItemCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.addContentItem' },
        { moduleId, ...dto },
      ),
    );
    return successResponse({ item });
  }

  @Put('items/:itemId')
  @Permissions('academy.delivery.write')
  async updateContentItem(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body(new ZodValidationPipe(academyClassContentItemUpdateDTOSchema))
    dto: AcademyClassContentItemUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.updateContentItem' },
        { id: itemId, input: dto },
      ),
    );
    return successResponse({ item });
  }

  @Delete('items/:itemId')
  @Permissions('academy.delivery.write')
  async deleteContentItem(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.deleteContentItem' },
        { id: itemId },
      ),
    );
    return successResponse(result);
  }

  // ==============================================================
  // LEARNER PROGRESS
  // ==============================================================

  @Get(':id/progress')
  @UseGuards(GatewayAuthGuard)
  async getUserProgress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const userId = req.requester.sub;
    const progress = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.getUserProgress' },
        { userId, classId: id },
      ),
    );
    return successResponse(progress);
  }

  @Post(':id/lessons/:lessonId/complete')
  @UseGuards(GatewayAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markLessonComplete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
    @Req() req: ReqWithRequester,
  ) {
    const userId = req.requester.sub;
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.markLessonComplete' },
        { userId, classId: id, lessonId },
      ),
    );
    return successResponse(result);
  }
}

