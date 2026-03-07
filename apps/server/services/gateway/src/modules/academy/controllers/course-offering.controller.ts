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
  Public,
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  ZodValidationPipe,
  successResponse,
} from '@server/shared';
import {
  AcademyCourseOfferingCreateDTO,
  AcademyCourseOfferingQueryDTO,
  AcademyCourseOfferingSetClassesDTO,
  AcademyCourseOfferingUpdateDTO,
  academyCourseOfferingCreateDTOSchema,
  academyCourseOfferingQueryDTOSchema,
  academyCourseOfferingSetClassesDTOSchema,
  academyCourseOfferingUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/course-offerings')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CourseOfferingController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

  @Public()
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(academyCourseOfferingQueryDTOSchema))
    query: AcademyCourseOfferingQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.commerce.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyCourseOfferingCreateDTOSchema))
    dto: AcademyCourseOfferingCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.create' }, dto),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.commerce.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyCourseOfferingUpdateDTOSchema))
    dto: AcademyCourseOfferingUpdateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.update' }, { id, input: dto }),
    );
    return successResponse({ item });
  }

  @Post(':id/set-classes')
  @Permissions('academy.commerce.write')
  async setClasses(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyCourseOfferingSetClassesDTOSchema))
    dto: AcademyCourseOfferingSetClassesDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseOffering.setClasses' },
        { offeringId: id, classIds: dto.classIds },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.commerce.write')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseOffering.delete' }, { id }),
    );
    return successResponse(result);
  }
}

