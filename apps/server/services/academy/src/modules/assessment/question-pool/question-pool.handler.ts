import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    AddPoolQuestionsDto,
    QuestionPoolCreateDto,
    QuestionPoolQueryDto,
    QuestionPoolUpdateDto,
    SampleQuestionsDto,
} from './dto/question-pool.dto';
import { QuestionPoolService } from './question-pool.service';

@Controller('academy/question-pools')
export class QuestionPoolHandler {
    constructor(private readonly service: QuestionPoolService) { }

    @Get()
    async findAll(@Query() query: QuestionPoolQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.service.findById(id);
    }

    @Post()
    async create(@Body() input: QuestionPoolCreateDto) {
        return this.service.create(input);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() input: QuestionPoolUpdateDto) {
        return this.service.update(id, input);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Get(':id/questions')
    async getQuestions(@Param('id') id: string) {
        return this.service.getPoolQuestions(id);
    }

    @Post(':id/questions')
    async addQuestions(
        @Param('id') id: string,
        @Body() input: AddPoolQuestionsDto,
    ) {
        return this.service.addQuestions(id, input);
    }

    @Delete(':id/questions/:questionId')
    async removeQuestion(
        @Param('id') id: string,
        @Param('questionId') questionId: string,
    ) {
        return this.service.removeQuestion(id, questionId);
    }

    @Post(':id/sample')
    async sample(@Param('id') id: string, @Body() input: SampleQuestionsDto) {
        return this.service.sampleQuestions(id, input);
    }
}
