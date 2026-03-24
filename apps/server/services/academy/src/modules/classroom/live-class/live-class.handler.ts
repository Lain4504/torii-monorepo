import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LiveClassService } from './live-class.service';

@Controller()
export class LiveClassHandler {
  constructor(private readonly service: LiveClassService) {}

  @MessagePattern({ cmd: 'academy.liveClass.findAll' })
  findAll(@Payload() query: any) {
    return this.service.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.liveClass.findById' })
  findById(@Payload() data: { id: string }) {
    return this.service.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.liveClass.create' })
  create(@Payload() data: any) {
    return this.service.create(data);
  }

  @MessagePattern({ cmd: 'academy.liveClass.update' })
  update(@Payload() data: any) {
    return this.service.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.liveClass.delete' })
  delete(@Payload() data: { id: string }) {
    return this.service.delete(data.id);
  }

  @MessagePattern({ cmd: 'academy.liveClass.findAssignments' })
  findAssignments(@Payload() data: { classId: string }) {
    return this.service.findAssignments(data.classId);
  }

  @MessagePattern({ cmd: 'academy.liveClass.addAssignment' })
  addAssignment(@Payload() data: any) {
    return this.service.addAssignment(data);
  }
}
