import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { QuestionBankService } from '../../modules/question-bank/question-bank.service';
import {
    type QuestionBankCreateDTO,
    type QuestionBankUpdateDTO,
    type QuestionBankQueryDTO,
    type QuestionBankResponseDTO,
    type PaginatedResponse,
} from '@workspace/schemas';
import { UserRole } from '@workspace/schemas';
import { FirebaseAuthGuard, RolesGuard, Roles } from '@server/shared';

@Controller('question-banks')
@UseGuards(FirebaseAuthGuard)
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
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    async create(@Body() input: QuestionBankCreateDTO): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.create(input);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    async update(
        @Param('id') id: string,
        @Body() input: QuestionBankUpdateDTO,
    ): Promise<QuestionBankResponseDTO> {
        return this.questionBankService.update(id, input);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.LECTURER)
    async delete(@Param('id') id: string): Promise<boolean> {
        return this.questionBankService.delete(id);
    }
}
