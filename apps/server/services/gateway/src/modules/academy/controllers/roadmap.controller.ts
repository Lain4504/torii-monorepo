import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GatewayAuthGuard,
  PermissionsGuard,
  ReqWithRequester,
  ZodValidationPipe,
  successResponse,
} from '@server/shared';
import {
  AcademyRoadmapReplanDTO,
  AcademyRoadmapTaskUpdateDTO,
  academyRoadmapReplanDTOSchema,
  academyRoadmapTaskUpdateDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy/roadmap')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class RoadmapController {
  constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) {}

  @Get('me')
  async getMyRoadmap(@Req() req: ReqWithRequester) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.roadmap.getMyRoadmap' },
        { userId: req.requester.sub },
      ),
    );
    return successResponse(result);
  }

  @Patch('tasks/:taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(academyRoadmapTaskUpdateDTOSchema))
    dto: AcademyRoadmapTaskUpdateDTO,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.roadmap.updateTask' },
        { userId: req.requester.sub, taskId, ...dto },
      ),
    );
    return successResponse(result);
  }

  @Post('replan')
  async manualReplan(
    @Body(new ZodValidationPipe(academyRoadmapReplanDTOSchema))
    dto: AcademyRoadmapReplanDTO,
    @Req() req: ReqWithRequester,
  ) {
    const result = await firstValueFrom(
      this.nats.send(
        { cmd: 'academy.roadmap.replan' },
        { userId: req.requester.sub, trigger: dto.trigger },
      ),
    );
    return successResponse(result);
  }
}

