import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssignmentService } from '../../modules/assignment/assignment.service';

@Controller()
export class AssignmentHandler {
  constructor(
    private readonly assignmentService: AssignmentService,
  ) {}

  @MessagePattern({ cmd: 'learning.assignment.create' })
  async create(@Payload() data: any) {
    const { requester, ...dto } = data;
    return this.assignmentService.create(requester, dto);
  }

  @MessagePattern({ cmd: 'learning.assignment.update' })
  async update(@Payload() data: any) {
    const { id, requester, ...dto } = data;
    return this.assignmentService.update(requester, id, dto);
  }

  @MessagePattern({ cmd: 'learning.assignment.publish' })
  async publish(@Payload() data: any) {
    const { id, requester } = data;
    return this.assignmentService.publish(requester, id);
  }

  @MessagePattern({ cmd: 'learning.assignment.findAll' })
  async findAll(@Payload() data: any) {
    const { requester, ...query } = data;
    return this.assignmentService.findAll(requester, query);
  }

  @MessagePattern({ cmd: 'learning.assignment.findOne' })
  async findOne(@Payload() data: any) {
    const { id } = data;
    return this.assignmentService.findOne(id);
  }

  @MessagePattern({ cmd: 'learning.assignment.delete' })
  async delete(@Payload() data: any) {
    const { id, requester } = data;
    return this.assignmentService.delete(requester, id);
  }
}
