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
  AcademyCourseProfileCreateDTO,
  academyCourseProfileCreateDTOSchema,
  AcademyCourseProfileQueryDTO,
  academyCourseProfileQueryDTOSchema,
  AcademyCourseProfileUpdateDTO,
  academyCourseProfileUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/course-profiles')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class CourseProfileController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.content.read')
  async findAll(
    @Query(new ZodValidationPipe(academyCourseProfileQueryDTOSchema))
    query: AcademyCourseProfileQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseProfile.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.courseProfile.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.content.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyCourseProfileCreateDTOSchema))
    dto: AcademyCourseProfileCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseProfile.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyCourseProfileUpdateDTOSchema))
    dto: AcademyCourseProfileUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseProfile.update' },
        { id, input: dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/archive')
  @Permissions('academy.content.write')
  async archive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseProfile.archive' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Delete(':id')
  @Permissions('academy.content.write')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.courseProfile.delete' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }
}
