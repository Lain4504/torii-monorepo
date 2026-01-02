import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { QuestionBankService } from '../../modules/question-bank/question-bank.service';
import {
    type QuestionBankCreateDTO,
    type QuestionBankUpdateDTO,
    type QuestionBankQueryDTO,
    type QuestionBankResponseDTO,
    type PaginatedResponse,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

@Controller('question-banks')
@UseGuards(GatewayAuthGuard)
export class QuestionBankController {
    constructor(private readonly questionBankService: QuestionBankService) { }

    @Get()
    async findAll(@Query() query: QuestionBankQueryDTO): Promise<PaginatedResponse<QuestionBankResponseDTO>> {
        return this.questionBankService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<QuestionBankResponseDTO | null> {
        return this.questionBankService.findOne(id);
    }

    @Post()
    async create(@Body() input: QuestionBankCreateDTO): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.create(input);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() input: QuestionBankUpdateDTO,
    ): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.update(id, input);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<boolean> {
        return this.questionBankService.delete(id);
    }
}
