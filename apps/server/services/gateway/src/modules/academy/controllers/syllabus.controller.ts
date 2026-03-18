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

@Controller('api/academy/syllabuses')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class SyllabusController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  @Permissions('academy.content.read')
  async findAll(@Query('courseProfileId') courseProfileId: string) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.syllabus.findAll' }, { courseProfileId }),
    );
    return successResponse({ items });
  }

  @Get(':id')
  @Permissions('academy.content.read')
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.syllabus.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.content.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: { courseProfileId: string; version: string; name?: string },
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.syllabus.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/clone')
  @Permissions('academy.content.write')
  async clone(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: { newVersion: string; newName?: string },
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.syllabus.clone' },
        { sourceSyllabusId: id, ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/publish')
  @Permissions('academy.content.write')
  async publish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.syllabus.publish' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Post(':id/lock')
  @Permissions('academy.content.write')
  async lock(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.syllabus.lock' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }
}
