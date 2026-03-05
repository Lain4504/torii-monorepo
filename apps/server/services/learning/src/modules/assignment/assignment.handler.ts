import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssignmentService } from '@server/learning/modules/assignment/assignment.service';
import {
  Requester,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  QueryAssignmentsDto,
} from '@workspace/schemas';

@Controller()
export class AssignmentHandler {
  constructor(private readonly assignmentService: AssignmentService) {}

  @MessagePattern({ cmd: 'learning.assignment.create' })
  async create(
    @Payload() data: CreateAssignmentDto & { requester: Requester },
  ) {
    const { requester, ...dto } = data;
    return this.assignmentService.create(requester, dto);
  }

  @MessagePattern({ cmd: 'learning.assignment.update' })
  async update(
    @Payload() data: UpdateAssignmentDto & { id: string; requester: Requester },
  ) {
    const { id, requester, ...dto } = data;
    return this.assignmentService.update(requester, id, dto);
  }

  @MessagePattern({ cmd: 'learning.assignment.publish' })
  async publish(@Payload() data: { id: string; requester: Requester }) {
    const { id, requester } = data;
    return this.assignmentService.publish(requester, id);
  }

  @MessagePattern({ cmd: 'learning.assignment.findAll' })
  async findAll(
    @Payload() data: QueryAssignmentsDto & { requester: Requester },
  ) {
    const { requester, ...query } = data;
    return this.assignmentService.findAll(requester, query);
  }

  @MessagePattern({ cmd: 'learning.assignment.findById' })
  async findById(@Payload() data: { id: string }) {
    const { id } = data;
    return this.assignmentService.findById(id);
  }

  @MessagePattern({ cmd: 'learning.assignment.delete' })
  async delete(@Payload() data: { id: string; requester: Requester }) {
    const { id, requester } = data;
    return this.assignmentService.delete(requester, id);
  }
}
