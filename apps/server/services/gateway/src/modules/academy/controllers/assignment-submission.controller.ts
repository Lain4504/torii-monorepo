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
  AcademyAssignmentSubmissionCreateDTO,
  AcademyAssignmentSubmissionQueryDTO,
  AcademyAssignmentSubmissionUpdateDTO,
  academyAssignmentSubmissionCreateDTOSchema,
  academyAssignmentSubmissionQueryDTOSchema,
  academyAssignmentSubmissionUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/assignment-submissions')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AssignmentSubmissionController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('exam.manage')
  async findAll(
    @Query(new ZodValidationPipe(academyAssignmentSubmissionQueryDTOSchema))
    query: AcademyAssignmentSubmissionQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assignmentSubmission.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('exam.manage')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assignmentSubmission.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('exam.manage')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyAssignmentSubmissionCreateDTOSchema))
    dto: AcademyAssignmentSubmissionCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.assignmentSubmission.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('exam.manage')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyAssignmentSubmissionUpdateDTOSchema))
    dto: AcademyAssignmentSubmissionUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.assignmentSubmission.update' },
        { id, input: dto },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('exam.manage')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.assignmentSubmission.delete' },
        { id },
      ),
    );
    return successResponse(result);
  }
}

