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
  AcademyQuestionCreateDTO,
  AcademyQuestionQueryDTO,
  AcademyQuestionUpdateDTO,
  academyQuestionCreateDTOSchema,
  academyQuestionQueryDTOSchema,
  academyQuestionUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/questions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class QuestionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('exam.manage')
  async findAll(
    @Query(new ZodValidationPipe(academyQuestionQueryDTOSchema))
    query: AcademyQuestionQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('exam.manage')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('exam.manage')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyQuestionCreateDTOSchema))
    dto: AcademyQuestionCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('exam.manage')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyQuestionUpdateDTOSchema))
    dto: AcademyQuestionUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.update' }, { id, input: dto }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('exam.manage')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.delete' }, { id }),
    );
    return successResponse(result);
  }
}

