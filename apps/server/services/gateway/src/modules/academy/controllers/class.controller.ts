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
import { ForbiddenException } from '@nestjs/common';
import {
  AcademyClassAssignmentCreateDTO,
  AcademyClassCreateDTO,
  AcademyClassDuplicateDTO,
  AcademyClassQueryDTO,
  AcademyClassUpdateDTO,
  academyClassAssignmentCreateDTOSchema,
  academyClassCreateDTOSchema,
  academyClassDuplicateDTOSchema,
  academyClassQueryDTOSchema,
  academyClassUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/classes')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ClassController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

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
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const requester = req.requester;
    const hasReadPerm =
      requester.permissions?.includes('academy.delivery.read') ||
      requester.permissions?.includes('*');

    if (!hasReadPerm) {
      const result = await firstValueFrom(
        this.nats.send(
          { cmd: 'academy.enrollment.check' },
          { userId: requester.sub, classId: id },
        ),
      );
      if (!result?.isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this class');
      }
    }

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
      this.nats.send(
        { cmd: 'academy.class.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
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
      this.nats.send(
        { cmd: 'academy.class.update' },
        { id, input: dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Get(':id/assignments')
  async getAssignments(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const requester = req.requester;
    const hasReadPerm =
      requester.permissions?.includes('academy.delivery.read') ||
      requester.permissions?.includes('*');

    if (!hasReadPerm) {
      const result = await firstValueFrom(
        this.nats.send(
          { cmd: 'academy.enrollment.check' },
          { userId: requester.sub, classId: id },
        ),
      );
      if (!result?.isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this class');
      }
    }

    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.getAssignments' }, { classId: id }),
    );
    return successResponse({ items });
  }

  @Post(':id/assignments')
  @Permissions('academy.delivery.write')
  @HttpCode(HttpStatus.CREATED)
  async addAssignment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyClassAssignmentCreateDTOSchema))
    dto: AcademyClassAssignmentCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.addAssignment' },
        {
          ...dto,
          classId: id,
          requesterId: req.requester?.sub,
        },
      ),
    );
    return successResponse({ item });
  }

  @Get(':id/curriculum')
  async getCurriculum(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const requester = req.requester;
    const hasReadPerm =
      requester.permissions?.includes('academy.delivery.read') ||
      requester.permissions?.includes('*');

    if (!hasReadPerm) {
      const result = await firstValueFrom(
        this.nats.send(
          { cmd: 'academy.enrollment.check' },
          { userId: requester.sub, classId: id },
        ),
      );
      if (!result?.isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this class');
      }
    }

    const curriculum = await firstValueFrom(
      this.nats.send({ cmd: 'academy.class.getCurriculum' }, { id }),
    );
    return successResponse({ curriculum });
  }

  @Post(':id/publish')
  @Permissions('academy.delivery.write')
  async publish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.publish' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/start')
  @Permissions('academy.delivery.write')
  async start(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.start' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/complete')
  @Permissions('academy.delivery.write')
  async complete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.complete' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/cancel')
  @Permissions('academy.delivery.write')
  async cancel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.cancel' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/archive')
  @Permissions('academy.delivery.write')
  async archive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.archive' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/submit-for-approval')
  @Permissions('academy.delivery.write')
  async submitForApproval(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.submitForApproval' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/approve')
  @Permissions('academy.delivery.approve')
  async approve(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.approve' },
        { id, requesterId: req.requester?.sub },
      ),
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
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.delete' },
        { id, requesterId: req.requester?.sub },
      ),
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

  // ==============================================================
  // LEARNER PROGRESS
  // ==============================================================

  @Get(':id/progress')
  @UseGuards(GatewayAuthGuard)
  async getUserProgress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const requester = req.requester;
    const userId = requester.sub;

    const hasReadPerm =
      requester.permissions?.includes('academy.delivery.read') ||
      requester.permissions?.includes('*');
    if (!hasReadPerm) {
      const result = await firstValueFrom(
        this.nats.send(
          { cmd: 'academy.enrollment.check' },
          { userId, classId: id },
        ),
      );
      if (!result?.isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this class');
      }
    }

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
    const requester = req.requester;
    const userId = requester.sub;

    const resultEnrollment = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.enrollment.check' },
        { userId, classId: id },
      ),
    );
    if (!resultEnrollment?.isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this class');
    }

    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.class.markLessonComplete' },
        { userId, classId: id, lessonId },
      ),
    );
    return successResponse(result);
  }
}
