import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
    AddPoolQuestionsDto,
    QuestionPoolCreateDto,
    QuestionPoolQueryDto,
    QuestionPoolUpdateDto,
    SampleQuestionsDto,
} from './dto/question-pool.dto';
import { QuestionPoolService } from './question-pool.service';

@Controller()
export class QuestionPoolHandler {
    constructor(private readonly service: QuestionPoolService) { }

    @MessagePattern({ cmd: 'academy.questionPool.findAll' })
    async findAll(@Payload() query: QuestionPoolQueryDto) {
        return this.service.findAll(query);
    }

    @MessagePattern({ cmd: 'academy.questionPool.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.service.findById(data.id);
    }

    @MessagePattern({ cmd: 'academy.questionPool.create' })
    async create(@Payload() input: QuestionPoolCreateDto) {
        return this.service.create(input);
    }

    @MessagePattern({ cmd: 'academy.questionPool.update' })
    async update(@Payload() data: { id: string; input: QuestionPoolUpdateDto }) {
        return this.service.update(data.id, data.input);
    }

    @MessagePattern({ cmd: 'academy.questionPool.delete' })
    async delete(@Payload() data: { id: string }) {
        return this.service.delete(data.id);
    }

    @MessagePattern({ cmd: 'academy.questionPool.getQuestions' })
    async getQuestions(@Payload() data: { id: string }) {
        return this.service.getPoolQuestions(data.id);
    }

    @MessagePattern({ cmd: 'academy.questionPool.addQuestions' })
    async addQuestions(@Payload() data: { id: string; input: AddPoolQuestionsDto }) {
        return this.service.addQuestions(data.id, data.input);
    }

    @MessagePattern({ cmd: 'academy.questionPool.removeQuestion' })
    async removeQuestion(@Payload() data: { id: string; questionId: string }) {
        return this.service.removeQuestion(data.id, data.questionId);
    }

    @MessagePattern({ cmd: 'academy.questionPool.sample' })
    async sample(@Payload() data: { id: string; input: SampleQuestionsDto }) {
        return this.service.sampleQuestions(data.id, data.input);
    }
}

