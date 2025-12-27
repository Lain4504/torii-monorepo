import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuestionBankService } from './question-bank.service';
import {
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  QuestionBankQueryDto,
  CreateQuestionBankResponseDto,
  UpdateQuestionBankResponseDto,
  DeleteQuestionBankResponseDto,
  GetQuestionBankByIdResponseDto,
  QuestionBankListResponseDto,
} from '@workspace/dtos';

@Controller()
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @MessagePattern({ cmd: 'question-bank.findAll' })
  async findAll(@Payload() query: QuestionBankQueryDto): Promise<QuestionBankListResponseDto> {
    return this.questionBankService.findAll(query);
  }

  @MessagePattern({ cmd: 'question-bank.findOne' })
  async findOne(@Payload() data: { id: string }): Promise<GetQuestionBankByIdResponseDto> {
    return this.questionBankService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'question-bank.create' })
  async create(@Payload() input: CreateQuestionBankDto): Promise<CreateQuestionBankResponseDto> {
    return this.questionBankService.create(input);
  }

  @MessagePattern({ cmd: 'question-bank.update' })
  async update(
    @Payload() data: { id: string; input: UpdateQuestionBankDto },
  ): Promise<UpdateQuestionBankResponseDto> {
    return this.questionBankService.update(data.id, data.input);
  }

  @MessagePattern({ cmd: 'question-bank.delete' })
  async delete(@Payload() data: { id: string }): Promise<DeleteQuestionBankResponseDto> {
    return this.questionBankService.delete(data.id);
  }
}
