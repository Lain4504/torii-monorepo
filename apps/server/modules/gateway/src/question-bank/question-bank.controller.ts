import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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

@Controller('api/question-bank')
export class QuestionBankController {
  constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) {}

  @Post()
  async create(@Body() input: CreateQuestionBankDto): Promise<CreateQuestionBankResponseDto> {
    return firstValueFrom(
      this.natsClient.send<CreateQuestionBankResponseDto>({ cmd: 'question-bank.create' }, input),
    );
  }

  @Get()
  async findAll(@Query() query: QuestionBankQueryDto): Promise<QuestionBankListResponseDto> {
    return firstValueFrom(
      this.natsClient.send<QuestionBankListResponseDto>(
        { cmd: 'question-bank.findAll' },
        query,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GetQuestionBankByIdResponseDto> {
    return firstValueFrom(
      this.natsClient.send<GetQuestionBankByIdResponseDto>(
        { cmd: 'question-bank.findOne' },
        { id },
      ),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateQuestionBankDto,
  ): Promise<UpdateQuestionBankResponseDto> {
    return firstValueFrom(
      this.natsClient.send<UpdateQuestionBankResponseDto>(
        { cmd: 'question-bank.update' },
        { id, input },
      ),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteQuestionBankResponseDto> {
    return firstValueFrom(
      this.natsClient.send<DeleteQuestionBankResponseDto>(
        { cmd: 'question-bank.delete' },
        { id },
      ),
    );
  }
}
