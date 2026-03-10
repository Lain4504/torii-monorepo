import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  successResponse,
  errorResponse,
  GatewayAuthGuard,
  ReqWithRequester,
} from '@server/shared';

@Controller('api/learning-progress')
@UseGuards(GatewayAuthGuard)
export class LearningProgressController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Get('my-courses')
  async getMyCourses(@Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.enrollment.findAll' },
          { userId: requester.sub },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch my courses');
    }
  }

  @Post('track')
  async trackProgress(
    @Req() req: ReqWithRequester,
    @Body() body: { contentItemId: string; classId: string; status: string; progressPercent: number },
  ) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.learningProgress.upsert' },
          {
            userId: requester.sub,
            classId: body.classId,
            contentItemId: body.contentItemId,
            status: body.status,
            progressPercent: body.progressPercent,
            lastAccessedAt: new Date(),
          },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to track progress');
    }
  }

  @Get('stats')
  async getStats(@Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.learningProgress.getStats' },
          { userId: requester.sub },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch stats');
    }
  }

  @Get('completed-lessons/:classId')
  async getCompletedLessons(
    @Req() req: ReqWithRequester,
    @Param('classId') classId: string,
  ) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.learningProgress.getCompletedIds' },
          { userId: requester.sub, classId },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(
        error.message || 'Failed to fetch completed lessons',
      );
    }
  }

  @Get('history')
  async getHistory(@Req() req: ReqWithRequester) {
    try {
      const requester = req.requester;
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.learningProgress.getHistory' },
          { userId: requester.sub },
        ),
      );
      return successResponse(result);
    } catch (error: any) {
      return errorResponse(error.message || 'Failed to fetch history');
    }
  }
}
