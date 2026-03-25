import {
  BadRequestException,
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
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  Permissions,
  PermissionsGuard,
  Public,
  ZodValidationPipe,
  successResponse,
  ReqWithRequester,
} from '@server/shared';
import { ForbiddenException } from '@nestjs/common';
import {
  AcademyLiveClassAssignmentCreateDTO,
  AcademyLiveClassCreateDTO,
  AcademyLiveClassDuplicateDTO,
  AcademyLiveClassQueryDTO,
  AcademyLiveClassUpdateDTO,
  academyLiveClassAssignmentCreateDTOSchema,
  academyLiveClassCreateDTOSchema,
  academyLiveClassDuplicateDTOSchema,
  academyLiveClassQueryDTOSchema,
  academyLiveClassUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/live-classes')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LiveClassController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

  @Get()
  @Permissions('academy.delivery.read')
  async findAll(
    @Query(new ZodValidationPipe(academyLiveClassQueryDTOSchema))
    query: AcademyLiveClassQueryDTO,
  ) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveClass.findAll' }, query),
    );
    return successResponse(items);
  }

  @Public()
  @Get('public')
  async findAllPublic(
    @Query(new ZodValidationPipe(academyLiveClassQueryDTOSchema))
    query: AcademyLiveClassQueryDTO,
  ) {
    const q = query as any;
    if (q.mode === 'VOD') {
      const items = await firstValueFrom(
        this.nats.send({ cmd: 'academy.vod.findAll' }, { ...query, status: 'PUBLISHED' }),
      );
      return successResponse(items);
    }

    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveClass.findAll' }, { ...query, status: 'OPENING' }),
    );
    return successResponse(items);
  }

  @Public()
  @Get('public/:id')
  async findPublicById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('mode') mode?: 'LIVE' | 'VOD',
  ) {
    // Detail page can pass mode explicitly; if missing, fallback LIVE -> VOD.
    if (mode === 'VOD') {
      const item = await firstValueFrom(
        this.nats.send({ cmd: 'academy.vod.findById' }, { id }),
      );
      return successResponse({ item: { ...item, mode: 'VOD' } });
    }

    try {
      const item = await firstValueFrom(
        this.nats.send({ cmd: 'academy.liveClass.findById' }, { id }),
      );
      return successResponse({ item: { ...item, mode: 'LIVE' } });
    } catch {
      const item = await firstValueFrom(
        this.nats.send({ cmd: 'academy.vod.findById' }, { id }),
      );
      return successResponse({ item: { ...item, mode: 'VOD' } });
    }
  }

  @Get(':id')
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const requester = req.requester;
    const hasReadPerm =
      requester.permissions?.includes('academy.delivery.read') ||
      requester.permissions?.includes('*');

    if (!hasReadPerm) {
      const result = await firstValueFrom(
        this.nats.send(
          { cmd: 'academy.enrollment.check' },
          { userId: requester.sub, liveClassId: id },
        ),
      );
      if (!result?.isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this class');
      }
    }

    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveClass.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Get(':id/curriculum')
  async getCurriculum(@Param('id', new ParseUUIDPipe()) id: string) {
    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveClass.findById' }, { id }),
    );

    const courseProfile = item.cohort?.courseProfile;
    if (!courseProfile) {
      throw new NotFoundException('Curriculum not found for this class');
    }

    return successResponse({
      curriculum: {
        id: courseProfile.id,
        modules: courseProfile.modules || [],
      },
    });
  }

  @Post()
  @Permissions('academy.delivery.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyLiveClassCreateDTOSchema))
    dto: AcademyLiveClassCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveClass.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(item);
  }

  @Put(':id')
  @Permissions('academy.delivery.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyLiveClassUpdateDTOSchema))
    dto: AcademyLiveClassUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveClass.update' },
        { id, input: dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(item);
  }

  @Delete(':id')
  @Permissions('academy.delivery.write')
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveClass.delete' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }

  // --- Assignments ---

  @Get(':id/assignments')
  @Permissions('academy.delivery.read')
  async findAssignments(@Param('id', new ParseUUIDPipe()) id: string) {
    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.liveClass.findAssignments' }, { classId: id }),
    );
    return successResponse({ items });
  }

  @Post(':id/assignments')
  @Permissions('academy.delivery.write')
  async addAssignment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyLiveClassAssignmentCreateDTOSchema))
    dto: AcademyLiveClassAssignmentCreateDTO,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.liveClass.addAssignment' },
        { ...dto, liveClassId: id },
      ),
    );
    return successResponse({ item });
  }
}
