import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RoadmapService } from './roadmap.service';
import { RoadmapReplanTrigger, RoadmapTaskStatus } from '@workspace/schemas';

@Controller()
export class RoadmapHandler {
  constructor(private readonly roadmapService: RoadmapService) {}

  @MessagePattern({ cmd: 'academy.roadmap.getMyRoadmap' })
  getMyRoadmap(@Payload() data: { userId: string }) {
    return this.roadmapService.getMyRoadmap(data.userId);
  }

  @MessagePattern({ cmd: 'academy.roadmap.updateTask' })
  updateTask(
    @Payload()
    data: {
      userId: string;
      taskId: string;
      status: RoadmapTaskStatus;
      actualMinutes?: number;
    },
  ) {
    return this.roadmapService.updateTask(
      data.userId,
      data.taskId,
      data.status,
      data.actualMinutes,
    );
  }

  @MessagePattern({ cmd: 'academy.roadmap.replan' })
  replan(
    @Payload()
    data: {
      userId: string;
      trigger: RoadmapReplanTrigger;
    },
  ) {
    return this.roadmapService.replanForUser(data.userId, data.trigger);
  }
}

