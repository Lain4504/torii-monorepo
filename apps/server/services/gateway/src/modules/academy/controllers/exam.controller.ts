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
  AcademyExamQueryDTO,
  AcademyExamUpdateDTO,
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
  @Permissions('exam.manage')
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
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('exam.manage')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyExamUpdateDTOSchema))
    dto: AcademyExamUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.update' }, { id, input: dto }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('exam.manage')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.exam.delete' }, { id }),
    );
    return successResponse(result);
  }
}

