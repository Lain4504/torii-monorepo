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
  AcademyExamAddQuestionsDTO,
  AcademyExamAddQuestionsFromPoolDTO,
  AcademyExamCreateDTO,
  AcademyExamQueryDTO,
  AcademyExamUpdateDTO,
  academyExamAddQuestionsDTOSchema,
  academyExamAddQuestionsFromPoolDTOSchema,
  academyExamCreateDTOSchema,
  academyExamQueryDTOSchema,
  academyExamUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/exams')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class ExamController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('exam.manage')
  async findAll(
    @Query(new ZodValidationPipe(academyExamQueryDTOSchema))
    query: AcademyExamQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('exam.manage')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyExamCreateDTOSchema))
    dto: AcademyExamCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.exam.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('exam.manage')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyExamUpdateDTOSchema))
    dto: AcademyExamUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.exam.update' },
        { id, input: dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('exam.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.exam.delete' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }

  @Post(':id/publish')
  @Permissions('exam.manage')
  async publish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.exam.publish' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/archive')
  @Permissions('exam.manage')
  async archive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.exam.archive' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/questions-from-pool')
  @Permissions('exam.manage')
  async addQuestionsFromPool(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyExamAddQuestionsFromPoolDTOSchema))
    dto: AcademyExamAddQuestionsFromPoolDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.exam.addQuestionsFromPool' },
        {
          examId: id,
          sectionId: dto.sectionId,
          poolId: dto.poolId,
          count: dto.count,
        },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/questions')
  @Permissions('exam.manage')
  async addQuestions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyExamAddQuestionsDTOSchema))
    dto: AcademyExamAddQuestionsDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.exam.addQuestions' },
        {
          examId: id,
          sectionId: dto.sectionId,
          questionIds: dto.questionIds,
          points: dto.points,
        },
      ),
    );
    return successResponse({ item });
  }
}
