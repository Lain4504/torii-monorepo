import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClassService } from './class.service';
import { ClassCreateDto, ClassQueryDto, ClassUpdateDto } from './dto/class.dto';

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
  create(@Payload() input: ClassCreateDto) {
    return this.classes.create(input);
  }

  @MessagePattern({ cmd: 'academy.class.update' })
  update(@Payload() data: { id: string; input: ClassUpdateDto }) {
    return this.classes.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.class.publish' })
  publish(@Payload() data: { id: string }) {
    return this.classes.publishClass(data.id);
  }

  @MessagePattern({ cmd: 'academy.class.start' })
  start(@Payload() data: { id: string }) {
    return this.classes.startClass(data.id);
  }

  @MessagePattern({ cmd: 'academy.class.complete' })
  complete(@Payload() data: { id: string }) {
    return this.classes.completeClass(data.id);
  }

  @MessagePattern({ cmd: 'academy.class.cancel' })
  cancel(@Payload() data: { id: string }) {
    return this.classes.cancelClass(data.id);
  }

  @MessagePattern({ cmd: 'academy.class.delete' })
  delete(@Payload() data: { id: string }) {
    return this.classes.delete(data.id);
  }
}

