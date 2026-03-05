import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssignmentTemplateService } from './assignment-template.service';
import {
  AssignmentTemplateCreateDto,
  AssignmentTemplateQueryDto,
  AssignmentTemplateUpdateDto,
} from './dto/assignment-template.dto';

@Controller()
export class AssignmentTemplateHandler {
  constructor(private readonly templates: AssignmentTemplateService) {}

  @MessagePattern({ cmd: 'academy.assignmentTemplate.findAll' })
  findAll(@Payload() query: AssignmentTemplateQueryDto) {
    return this.templates.findAll(query);
  }

  @MessagePattern({ cmd: 'academy.assignmentTemplate.findById' })
  findById(@Payload() data: { id: string }) {
    return this.templates.findById(data.id);
  }

  @MessagePattern({ cmd: 'academy.assignmentTemplate.create' })
  create(@Payload() input: AssignmentTemplateCreateDto) {
    return this.templates.create(input);
  }

  @MessagePattern({ cmd: 'academy.assignmentTemplate.update' })
  update(@Payload() data: { id: string; input: AssignmentTemplateUpdateDto }) {
    return this.templates.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'academy.assignmentTemplate.delete' })
  delete(@Payload() data: { id: string }) {
    return this.templates.delete(data.id);
  }
}

