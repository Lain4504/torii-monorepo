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
import { ForbiddenException } from '@nestjs/common';
import {
  AcademyLessonCreateDTO,
  academyLessonCreateDTOSchema,
  AcademyLessonQueryDTO,
  academyLessonQueryDTOSchema,
  AcademyLessonUpdateDTO,
  academyLessonUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/lessons')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class LessonController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(academyLessonQueryDTOSchema))
    query: AcademyLessonQueryDTO,
    @Req() req: ReqWithRequester,
  ) {
    const requester = req.requester;
    const hasContentRead =
      requester.permissions?.includes('academy.content.read') ||
      requester.permissions?.includes('*');

    if (!hasContentRead) {
      if (!query.syllabusId) {
        throw new ForbiddenException('syllabusId is required for learners');
      }
      const result = await firstValueFrom(
        this.nats.send(
          { cmd: 'academy.enrollment.checkBySyllabus' },
          { userId: requester.sub, syllabusId: query.syllabusId },
        ),
      );
      if (!result?.isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this syllabus');
      }
    }

    const items = await firstValueFrom(
      this.nats.send({ cmd: 'academy.lesson.findAll' }, query),
    );
    return successResponse({ items });
  }

  @Get(':id')
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: ReqWithRequester,
  ) {
    const requester = req.requester;
    const hasContentRead =
      requester.permissions?.includes('academy.content.read') ||
      requester.permissions?.includes('*');

    if (!hasContentRead) {
      // Find lesson first to get syllabusId
      const lesson = await firstValueFrom(
        this.nats.send({ cmd: 'academy.lesson.findById' }, { id }),
      );
      if (!lesson) throw new ForbiddenException('Lesson not found');
      const syllabusId = lesson.module?.syllabusId;

      if (!syllabusId) {
        throw new ForbiddenException(
          'Lesson is not associated with any syllabus',
        );
      }

      const result = await firstValueFrom(
        this.nats.send(
          { cmd: 'academy.enrollment.checkBySyllabus' },
          { userId: requester.sub, syllabusId },
        ),
      );
      if (!result?.isEnrolled) {
        throw new ForbiddenException(
          'You are not enrolled in a class providing this lesson',
        );
      }
    }

    const item = await firstValueFrom(
      this.nats.send({ cmd: 'academy.lesson.findById' }, { id }),
    );
    return successResponse({ item });
  }

  @Post()
  @Permissions('academy.content.write')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ZodValidationPipe(academyLessonCreateDTOSchema))
    dto: AcademyLessonCreateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.lesson.create' },
        { ...dto, requesterId: req.requester?.sub },
      ),
    );
    return successResponse({ item });
  }

  @Put(':id')
  @Permissions('academy.content.write')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(academyLessonUpdateDTOSchema))
    dto: AcademyLessonUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const item = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.lesson.update' },
        { id, input: dto, requesterId: req.requester?.sub },
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
        { cmd: 'academy.lesson.delete' },
        { id, requesterId: req.requester?.sub },
      ),
    );
    return successResponse(result);
  }
}
