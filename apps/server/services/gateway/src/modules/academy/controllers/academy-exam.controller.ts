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
  AcademyExamCreateDTO,
  academyExamCreateDTOSchema,
  AcademyExamUpdateDTO,
  academyExamUpdateDTOSchema,
  AcademyExamQueryDTO,
  academyExamQueryDTOSchema,
  AcademyExamAddQuestionsDTO,
  academyExamAddQuestionsDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/exams')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AcademyExamController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.content.read')
  async findAll(
    @Query(new ZodValidationPipe(academyExamQueryDTOSchema))
    query: AcademyExamQueryDTO,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.findAll' }, query),
    );
    return successResponse({ items: result });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.content.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyExamCreateDTOSchema))
    dto: AcademyExamCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyExamUpdateDTOSchema))
    dto: AcademyExamUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.update' }, { id, dto }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.content.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.delete' }, { id }),
    );
    return successResponse(result);
  }

  @Post('add-questions')
  @Permissions('academy.content.write')
  async addQuestions(
    @Body(new ZodValidationPipe(academyExamAddQuestionsDTOSchema))
    dto: AcademyExamAddQuestionsDTO,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.addQuestions' }, dto),
    );
    return successResponse(result);
  }

  @Delete('questions/:id')
  @Permissions('academy.content.write')
  async removeQuestion(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.removeQuestion' }, { id }),
    );
    return successResponse(result);
  }
}
