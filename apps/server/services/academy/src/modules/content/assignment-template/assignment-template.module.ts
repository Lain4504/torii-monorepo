import { Module } from '@nestjs/common';
import { AssignmentTemplateHandler } from './assignment-template.handler';
import { AssignmentTemplateService } from './assignment-template.service';

@Module({
  providers: [AssignmentTemplateService],
  controllers: [AssignmentTemplateHandler],
})
export class AssignmentTemplateModule {}

