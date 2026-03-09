import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
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
  ReqWithRequester,
  ZodValidationPipe,
  successResponse,
} from '@server/shared';
import {
  AcademyExamAttemptQueryDTO,
  AcademyExamAttemptSaveAnswersDTO,
  AcademyExamAttemptStartDTO,
  AcademyExamAttemptSubmitDTO,
  academyExamAttemptQueryDTOSchema,
  academyExamAttemptSaveAnswersDTOSchema,
  academyExamAttemptStartDTOSchema,
  academyExamAttemptSubmitDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/exam-attempts')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ExamAttemptController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

  private hasExamManagePermission(req: ReqWithRequester): boolean {
    const permissions = req.requester?.permissions || [];
    return permissions.includes('*') || permissions.includes('exam.manage');
  }

  @Get()
  @Permissions('exam.manage')
  async findAll(
    @Query(new ZodValidationPipe(academyExamAttemptQueryDTOSchema))
    query: AcademyExamAttemptQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.examAttempt.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: ReqWithRequester) {
    const isExamManager = this.hasExamManagePermission(req);
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.examAttempt.findById' },
        { id, requesterId: req.requester?.sub, isExamManager },
      ),
    );
    return successResponse({ item });
  }

  @Post('start')
  @Permissions('academy.delivery.read')
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Body(new ZodValidationPipe(academyExamAttemptStartDTOSchema))
    dto: AcademyExamAttemptStartDTO,
    @Req() req: ReqWithRequester,
  ) {
    const isExamManager = this.hasExamManagePermission(req);
    const resolvedUserId = isExamManager && dto.userId ? dto.userId : req.requester?.sub;
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.examAttempt.start' },
        { ...dto, userId: resolvedUserId, requesterId: req.requester?.sub, isExamManager },
      ),
    );
    return successResponse({ item });
  }

  @Post('save-answers')
  @Permissions('academy.delivery.read')
  async saveAnswers(
    @Body(new ZodValidationPipe(academyExamAttemptSaveAnswersDTOSchema))
    dto: AcademyExamAttemptSaveAnswersDTO,
    @Req() req: ReqWithRequester,
  ) {
    const isExamManager = this.hasExamManagePermission(req);
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.examAttempt.saveAnswers' },
        { ...dto, requesterId: req.requester?.sub, isExamManager },
      ),
    );
    return successResponse({ item });
  }

  @Post('submit')
  @Permissions('academy.delivery.read')
  async submit(
    @Body(new ZodValidationPipe(academyExamAttemptSubmitDTOSchema))
    dto: AcademyExamAttemptSubmitDTO,
    @Req() req: ReqWithRequester,
  ) {
    const isExamManager = this.hasExamManagePermission(req);
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.examAttempt.submit' },
        { ...dto, requesterId: req.requester?.sub, isExamManager },
      ),
    );
    return successResponse({ item });
  }
}

