import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionBankService } from './question-bank.service';
import {
  type QuestionBankCreateDTO,
  type QuestionBankUpdateDTO,
  type QuestionBankQueryDTO,
  type QuestionBankResponseDTO,
  type PaginatedResponse,
} from '@workspace/schemas';

@Controller()
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) { }

  @MessagePattern({ cmd: 'question-bank.findAll' })
  async findAll(@Payload() query: QuestionBankQueryDTO): Promise<PaginatedResponse<QuestionBankResponseDTO>> {
    return this.questionBankService.findAll(query);
  }

  @MessagePattern({ cmd: 'question-bank.findOne' })
  async findOne(@Payload() data: { id: string }): Promise<QuestionBankResponseDTO | null> {
    return this.questionBankService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'question-bank.create' })
  async create(@Payload() input: QuestionBankCreateDTO): Promise<QuestionBankResponseDTO> {
    return this.questionBankService.create(input);
  }

  @MessagePattern({ cmd: 'question-bank.update' })
  async update(
    @Payload() data: { id: string; input: QuestionBankUpdateDTO },
  ): Promise<QuestionBankResponseDTO> {
    return this.questionBankService.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'question-bank.delete' })
  async delete(@Payload() data: { id: string }): Promise<boolean> {
    return this.questionBankService.delete(data.id);
  }
}
