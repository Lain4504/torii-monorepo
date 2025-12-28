import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';
import {
  type QuestionBankCreateDTO,
  type QuestionBankUpdateDTO,
  type QuestionBankQueryDTO,
  type QuestionBankResponseDTO,
  type PaginatedResponse,
  questionBankCreateDTOSchema,
  questionBankUpdateDTOSchema,
  questionBankQueryDTOSchema,
} from '@workspace/schemas';

@Controller('api/question-bank')
export class QuestionBankController {
  constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

  @Post()
  @UsePipes(new ZodValidationPipe(questionBankCreateDTOSchema))
  async create(@Body() input: QuestionBankCreateDTO): Promise<QuestionBankResponseDTO> {
    return firstValueFrom(
      this.natsClient.send<QuestionBankResponseDTO>({ cmd: 'question-bank.create' }, input),
    );
  }

  @Get()
  async findAll(@Query() query: QuestionBankQueryDTO): Promise<PaginatedResponse<QuestionBankResponseDTO>> {
    return firstValueFrom(
      this.natsClient.send<PaginatedResponse<QuestionBankResponseDTO>>(
        { cmd: 'question-bank.findAll' },
        query,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<QuestionBankResponseDTO | null> {
    return firstValueFrom(
      this.natsClient.send<QuestionBankResponseDTO | null>(
        { cmd: 'question-bank.findOne' },
        { id },
      ),
    );
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(questionBankUpdateDTOSchema))
  async update(
    @Param('id') id: string,
    @Body() input: QuestionBankUpdateDTO,
  ): Promise<QuestionBankResponseDTO> {
    return firstValueFrom(
      this.natsClient.send<QuestionBankResponseDTO>(
        { cmd: 'question-bank.update' },
        { id, input },
      ),
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return firstValueFrom(
      this.natsClient.send<boolean>(
        { cmd: 'question-bank.delete' },
        { id },
      ),
    );
  }
}
