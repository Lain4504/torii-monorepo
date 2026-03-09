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
  AcademyClassAssessmentAttemptQueryDTO,
  AcademyClassAssessmentCreateDTO,
  AcademyClassAssessmentQueryDTO,
  AcademyClassAssessmentUpdateDTO,
  academyClassAssessmentAttemptQueryDTOSchema,
  academyClassAssessmentCreateDTOSchema,
  academyClassAssessmentQueryDTOSchema,
  academyClassAssessmentUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/class-assessments')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ClassAssessmentController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(academyClassAssessmentQueryDTOSchema))
    query: AcademyClassAssessmentQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classAssessment.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.delivery.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classAssessment.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.delivery.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyClassAssessmentCreateDTOSchema))
    dto: AcademyClassAssessmentCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classAssessment.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.delivery.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyClassAssessmentUpdateDTOSchema))
    dto: AcademyClassAssessmentUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.classAssessment.update' },
        { id, input: dto },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classAssessment.delete' }, { id }),
    );
    return successResponse(result);
  }

  @Get(':id/attempts')
  @Permissions('academy.delivery.read')
  async findAttempts(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query(new ZodValidationPipe(academyClassAssessmentAttemptQueryDTOSchema))
    query: AcademyClassAssessmentAttemptQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.classAssessment.findAttempts' }, { id, query }),
    );
    return successResponse({ items });
  }

  @Get(':id/attempts/:attemptId/detail')
  @Permissions('academy.delivery.read')
  async findAttemptQuestionDetail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.classAssessment.findAttemptQuestionDetail' },
        { id, attemptId },
      ),
    );
    return successResponse({ item });
  }

  @Get(':id/wrong-question-analytics')
  @Permissions('academy.delivery.read')
  async findWrongQuestionAnalytics(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query(new ZodValidationPipe(academyClassAssessmentAttemptQueryDTOSchema))
    query: AcademyClassAssessmentAttemptQueryDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.classAssessment.findWrongQuestionAnalytics' },
        { id, query },
      ),
    );
    return successResponse({ item });
  }
}

