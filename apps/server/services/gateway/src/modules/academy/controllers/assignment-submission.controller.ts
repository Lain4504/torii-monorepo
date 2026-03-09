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
  AcademyAssignmentSubmissionCreateDTO,
  AcademyAssignmentSubmissionQueryDTO,
  AcademyAssignmentSubmissionUpdateDTO,
  academyAssignmentSubmissionCreateDTOSchema,
  academyAssignmentSubmissionQueryDTOSchema,
  academyAssignmentSubmissionUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/assignment-submissions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AssignmentSubmissionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

  private hasExamManagePermission(req: ReqWithRequester): boolean {
    const permissions = req.requester?.permissions || [];
    return permissions.includes('*') || permissions.includes('exam.manage');
  }

  @Get()
  @Permissions('academy.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(academyAssignmentSubmissionQueryDTOSchema))
    query: AcademyAssignmentSubmissionQueryDTO,
    @Req() req: ReqWithRequester,
  ) {
    const isExamManager = this.hasExamManagePermission(req);
    const items = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.assignmentSubmission.findAll' },
        {
          ...query,
          requesterId: req.requester?.sub,
          isExamManager,
          userId: isExamManager ? query.userId : req.requester?.sub,
        },
      ),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const isExamManager = this.hasExamManagePermission(req);
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.assignmentSubmission.findById' },
        { id, requesterId: req.requester?.sub, isExamManager },
      ),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.delivery.read')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyAssignmentSubmissionCreateDTOSchema))
    dto: AcademyAssignmentSubmissionCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const isExamManager = this.hasExamManagePermission(req);
    const resolvedUserId = isExamManager && dto.userId ? dto.userId : req.requester?.sub;
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.assignmentSubmission.create' },
        { ...dto, userId: resolvedUserId, requesterId: req.requester?.sub, isExamManager },
      ),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.delivery.read')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyAssignmentSubmissionUpdateDTOSchema))
    dto: AcademyAssignmentSubmissionUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const isExamManager = this.hasExamManagePermission(req);
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.assignmentSubmission.update' },
        { id, input: dto, requesterId: req.requester?.sub, isExamManager },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('exam.manage')
  async delete(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const isExamManager = this.hasExamManagePermission(req);
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.assignmentSubmission.delete' },
        { id, requesterId: req.requester?.sub, isExamManager },
      ),
    );
    return successResponse(result);
  }
}

