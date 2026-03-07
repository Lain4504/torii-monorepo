import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PlacementService } from './placement.service';

@Controller()
export class PlacementHandler {
  constructor(private readonly placement: PlacementService) { }

  @MessagePattern({ cmd: 'academy.placement.info' })
  getInfo(
    @Payload()
    data: {
      userId: string;
    },
  ) {
    return this.placement.getInfo(data.userId);
  }

  @MessagePattern({ cmd: 'academy.placement.start' })
  start(
    @Payload()
    data: {
      userId: string;
    },
  ) {
    return this.placement.start({ userId: data.userId });
  }

  @MessagePattern({ cmd: 'academy.placement.submit' })
  submit(
    @Payload()
    data: {
      userId: string;
      attemptId: string;
      answers: Record<string, unknown>;
    },
  ) {
    return this.placement.submit({
      userId: data.userId,
      attemptId: data.attemptId,
      answers: data.answers,
    });
  }
}

