import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Inject,
  Req,
} from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  GatewayAuthGuard,
  ReqWithRequester,
  ZodValidationPipe,
  successResponse,
  errorResponse,
} from '@server/shared';
import { firstValueFrom } from 'rxjs';
import {
  CreateStudyNoteDto,
  UpdateStudyNoteDto,
  createStudyNoteSchema,
  updateStudyNoteSchema,
} from '../../../../../academy/src/modules/study-note/study-note.dto';

@Controller('api/academy/study-notes')
@UseGuards(GatewayAuthGuard)
export class StudyNoteController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  private hasContentReadPermission(req: ReqWithRequester): boolean {
    const permissions = req.requester?.permissions || [];
    return (
      permissions.includes('*') ||
      permissions.includes('academy.content.read') ||
      permissions.includes('academy.delivery.read')
    );
  }

  private async assertEnrolledForLesson(userId: string, lessonId: string) {
    const lesson = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'academy.lesson.findById' },
        { id: lessonId },
      ),
    );
    const syllabusId = lesson?.module?.syllabusId;
    if (!syllabusId) {
      throw new ForbiddenException(
        'Lesson is not associated with any syllabus',
      );
    }

    const result = await firstValueFrom(
      this.natsClient.send(
        { cmd: 'academy.enrollment.checkBySyllabus' },
        { userId, syllabusId },
      ),
    );
    if (!result?.isEnrolled) {
      throw new ForbiddenException(
        'You are not enrolled in a class providing this lesson',
      );
    }
  }

  @Post()
  async create(
    @Req() req: ReqWithRequester,
    @Body(new ZodValidationPipe(createStudyNoteSchema))
    createDto: CreateStudyNoteDto,
  ) {
    try {
      const requester = req.requester;
      const hasContentRead = this.hasContentReadPermission(req);
      if (!hasContentRead && createDto.lessonId) {
        await this.assertEnrolledForLesson(requester.sub, createDto.lessonId);
      }

      const item = await firstValueFrom(
        this.natsClient.send('academy.study-note.create', {
          userId: req.requester.sub,
          data: createDto,
        }),
      );
      return successResponse({ item });
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      return errorResponse(error.message);
    }
  }

  @Get()
  async findAll(
    @Req() req: ReqWithRequester,
    @Query('lessonId') lessonId?: string,
  ) {
    try {
      const requester = req.requester;
      const hasContentRead = this.hasContentReadPermission(req);
      if (!hasContentRead && lessonId) {
        await this.assertEnrolledForLesson(requester.sub, lessonId);
      }

      const items = await firstValueFrom(
        this.natsClient.send('academy.study-note.findAll', {
          userId: req.requester.sub,
          lessonId,
        }),
      );
      return successResponse({ items });
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      return errorResponse(error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: ReqWithRequester) {
    try {
      const item = await firstValueFrom(
        this.natsClient.send('academy.study-note.findOne', {
          id,
          userId: req.requester.sub,
        }),
      );

      const requester = req.requester;
      const hasContentRead = this.hasContentReadPermission(req);
      const lessonId = item?.lessonId;
      if (!hasContentRead && lessonId) {
        await this.assertEnrolledForLesson(requester.sub, lessonId);
      }

      return successResponse({ item });
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      return errorResponse(error.message);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: ReqWithRequester,
    @Body(new ZodValidationPipe(updateStudyNoteSchema))
    updateDto: UpdateStudyNoteDto,
  ) {
    try {
      const requester = req.requester;
      const hasContentRead = this.hasContentReadPermission(req);

      const existing = await firstValueFrom(
        this.natsClient.send('academy.study-note.findOne', {
          id,
          userId: req.requester.sub,
        }),
      );
      const lessonId = existing?.lessonId;
      if (!hasContentRead && lessonId) {
        await this.assertEnrolledForLesson(requester.sub, lessonId);
      }

      const item = await firstValueFrom(
        this.natsClient.send('academy.study-note.update', {
          id,
          userId: req.requester.sub,
          data: updateDto,
        }),
      );
      return successResponse({ item });
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      return errorResponse(error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const hasContentRead = this.hasContentReadPermission(req);

      const existing = await firstValueFrom(
        this.natsClient.send('academy.study-note.findOne', {
          id,
          userId: req.requester.sub,
        }),
      );
      const lessonId = existing?.lessonId;
      if (!hasContentRead && lessonId) {
        await this.assertEnrolledForLesson(requester.sub, lessonId);
      }

      const result = await firstValueFrom(
        this.natsClient.send('academy.study-note.remove', {
          id,
          userId: req.requester.sub,
        }),
      );
      return successResponse({ result });
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      return errorResponse(error.message);
    }
  }
}
