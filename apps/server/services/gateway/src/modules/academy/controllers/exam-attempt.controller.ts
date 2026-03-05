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
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

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
  @Permissions('exam.manage')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.examAttempt.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post('start')
  @Permissions('exam.manage')
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Body(new ZodValidationPipe(academyExamAttemptStartDTOSchema))
    dto: AcademyExamAttemptStartDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.examAttempt.start' }, dto),
    );
    return successResponse({ item });
  }

  @Post('save-answers')
  @Permissions('exam.manage')
  async saveAnswers(
    @Body(new ZodValidationPipe(academyExamAttemptSaveAnswersDTOSchema))
    dto: AcademyExamAttemptSaveAnswersDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.examAttempt.saveAnswers' }, dto),
    );
    return successResponse({ item });
  }

  @Post('submit')
  @Permissions('exam.manage')
  async submit(
    @Body(new ZodValidationPipe(academyExamAttemptSubmitDTOSchema))
    dto: AcademyExamAttemptSubmitDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.examAttempt.submit' }, dto),
    );
    return successResponse({ item });
  }
}

