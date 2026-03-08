import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClassService } from './class.service';
import { ClassCreateDto, ClassDuplicateDto, ClassQueryDto, ClassUpdateDto } from './dto/class.dto';

@Controller()
export class ClassHandler {
  constructor(private readonly classes: ClassService) { }

  @MessagePattern({ cmd: 'academy.class.findAll' })
  findAll(@Payload() query: ClassQueryDto) {
    return this.classes.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.class.findById' })
  findById(@Payload() data: { id: string }) {
    return this.classes.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.class.create' })
  create(@Payload() data: ClassCreateDto & { requesterId?: string }) {
    const { requesterId, ...input } = data;
    return this.classes.create(input, requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.update' })
  update(@Payload() data: { id: string; input: ClassUpdateDto; requesterId?: string }) {
    return this.classes.update(data.id, data.input, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.publish' })
  publish(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.publishClass(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.submitForApproval' })
  submitForApproval(@Payload() data: { id: string; requesterId: string }) {
    return this.classes.submitForApproval(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.approve' })
  approve(@Payload() data: { id: string; requesterId: string }) {
    return this.classes.approve(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.reject' })
  reject(@Payload() data: { id: string; reason: string; requesterId: string }) {
    return this.classes.reject(data.id, data.reason, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.start' })
  start(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.startClass(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.complete' })
  complete(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.completeClass(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.cancel' })
  cancel(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.cancelClass(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.getCurriculum' })
  getCurriculum(@Payload() data: { id: string }) {
    return this.classes.getCurriculum(data.id);
  }

  @MessagePattern({ cmd: 'academy.class.delete' })
  delete(@Payload() data: { id: string; requesterId?: string }) {
    return this.classes.delete(data.id, data.requesterId);
  }

  @MessagePattern({ cmd: 'academy.class.duplicate' })
  duplicate(@Payload() data: { id: string; input?: ClassDuplicateDto; requesterId?: string }) {
    return this.classes.duplicate(data.id, data.input, data.requesterId);
  }
}

