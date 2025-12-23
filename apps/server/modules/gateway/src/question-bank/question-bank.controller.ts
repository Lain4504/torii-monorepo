import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  QuestionType,
  QuestionDifficultyLevel,
  QuestionStatus,
  QuestionJlptLevel,
} from '@workspace/dtos';

@ApiTags('question-bank')
@Controller('question-bank')
export class QuestionBankController {
  constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  async create(@Body() input: CreateQuestionBankDto): Promise<CreateQuestionBankResponseDto> {
    return firstValueFrom(
      this.natsClient.send<CreateQuestionBankResponseDto>({ cmd: 'question-bank.create' }, input),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return question list' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'questionType', required: false, enum: QuestionType })
  @ApiQuery({ name: 'jlptLevel', required: false, enum: QuestionJlptLevel })
  @ApiQuery({ name: 'difficulty', required: false, enum: QuestionDifficultyLevel })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: QuestionStatus })
  async findAll(@Query() query: QuestionBankQueryDto): Promise<QuestionBankListResponseDto> {
    return firstValueFrom(
      this.natsClient.send<QuestionBankListResponseDto>(
        { cmd: 'question-bank.findAll' },
        query,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiResponse({ status: 200, description: 'Return question details' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async findOne(@Param('id') id: string): Promise<GetQuestionBankByIdResponseDto> {
    return firstValueFrom(
      this.natsClient.send<GetQuestionBankByIdResponseDto>(
        { cmd: 'question-bank.findOne' },
        { id },
      ),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
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
  @ApiOperation({ summary: 'Delete question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async delete(@Param('id') id: string): Promise<DeleteQuestionBankResponseDto> {
    return firstValueFrom(
      this.natsClient.send<DeleteQuestionBankResponseDto>(
        { cmd: 'question-bank.delete' },
        { id },
      ),
    );
  }
}
