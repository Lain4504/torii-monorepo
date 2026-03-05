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
  AcademyClassAssessmentCreateDTO,
  AcademyClassAssessmentQueryDTO,
  AcademyClassAssessmentUpdateDTO,
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
}

