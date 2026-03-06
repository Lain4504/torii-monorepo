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
  AcademyAssignmentTemplateCreateDTO,
  academyAssignmentTemplateCreateDTOSchema,
  AcademyAssignmentTemplateQueryDTO,
  academyAssignmentTemplateQueryDTOSchema,
  AcademyAssignmentTemplateUpdateDTO,
  academyAssignmentTemplateUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/assignment-templates')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AssignmentTemplateController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.content.read')
  async findAll(
    @Query(new ZodValidationPipe(academyAssignmentTemplateQueryDTOSchema))
    query: AcademyAssignmentTemplateQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assignmentTemplate.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assignmentTemplate.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.content.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyAssignmentTemplateCreateDTOSchema))
    dto: AcademyAssignmentTemplateCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assignmentTemplate.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyAssignmentTemplateUpdateDTOSchema))
    dto: AcademyAssignmentTemplateUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assignmentTemplate.update' }, { id, input: dto }),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.content.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assignmentTemplate.delete' }, { id }),
    );
    return successResponse(result);
  }
}
