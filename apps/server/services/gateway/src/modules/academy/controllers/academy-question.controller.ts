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
  academyQuestionCreateDTOSchema,
  AcademyQuestionUpdateDTO,
  academyQuestionUpdateDTOSchema,
  AcademyQuestionQueryDTO,
  academyQuestionQueryDTOSchema,
  AcademyQuestionCategoryDTO,
  academyQuestionCategorySchema,
} from '@workspace/schemas';

@Controller('api/academy/questions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AcademyQuestionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.content.read')
  async findAll(
    @Query(new ZodValidationPipe(academyQuestionQueryDTOSchema))
    query: AcademyQuestionQueryDTO,
  ) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.findAll' }, query),
    );
    return successResponse({ items: result });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.content.write')
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
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyQuestionUpdateDTOSchema))
    dto: AcademyQuestionUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.update' }, { id, dto }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.content.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.delete' }, { id }),
    );
    return successResponse(result);
  }

  @Get('categories')
  @Permissions('academy.content.read')
  async getCategories() {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.getCategories' }, {}),
    );
    return successResponse(result);
  }

  @Post('categories')
  @Permissions('academy.content.write')
  async createCategory(
    @Body(new ZodValidationPipe(academyQuestionCategorySchema))
    dto: AcademyQuestionCategoryDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.question.createCategory' }, dto),
    );
    return successResponse({ item });
  }
}
