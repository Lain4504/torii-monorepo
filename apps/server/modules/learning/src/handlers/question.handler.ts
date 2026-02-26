import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { QUESTION_SERVICE_TOKEN, IQuestionService } from '@server/learning/interfaces/services/i-question.service';
import { QuestionCreateDTO, QuestionUpdateDTO, QuestionQueryDTO, Requester, UserRole } from '@workspace/schemas';

@Controller()
export class QuestionHandler {
    constructor(
        @Inject(QUESTION_SERVICE_TOKEN)
        private readonly questionService: IQuestionService,
    ) { }

    @MessagePattern({ cmd: 'learning.question.findAll' })
    async findAll(@Payload() query: QuestionQueryDTO) {
        return this.questionService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.question.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.questionService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.question.getByCategory' })
    async getByCategory(@Payload() data: { category: string }) {
        return this.questionService.getByCategory(data.category);
    }

    @MessagePattern({ cmd: 'learning.question.getByJlptLevel' })
    async getByJlptLevel(@Payload() data: { jlptLevel: string }) {
        return this.questionService.getByJlptLevel(data.jlptLevel);
    }

    @MessagePattern({ cmd: 'learning.question.getByStatus' })
    async getByStatus(@Payload() data: { status: string }) {
        return this.questionService.getByStatus(data.status);
    }

    @MessagePattern({ cmd: 'learning.question.getByPool' })
    async getByPool(@Payload() data: { poolId: string }) {
        return this.questionService.getByPool(data.poolId);
    }

    @MessagePattern({ cmd: 'learning.question.create' })
    async create(@Payload() data: QuestionCreateDTO & { requester: Requester }) {
        const { requester, ...dto } = data;
        return this.questionService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.question.createMany' })
    async createMany(@Payload() data: { dtos: QuestionCreateDTO[], requester: Requester }) {
        const { requester, dtos } = data;
        return this.questionService.createMany(requester, dtos);
    }

    @MessagePattern({ cmd: 'learning.question.update' })
    async update(@Payload() data: QuestionUpdateDTO & { id: string, requester: Requester }) {
        const { id, requester, ...dto } = data;
        return this.questionService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.question.updateMany' })
    async updateMany(@Payload() data: { questionIds: string[], dto: QuestionUpdateDTO, requester: Requester }) {
        const { questionIds, dto, requester } = data;
        return this.questionService.updateMany(requester, questionIds, dto);
    }

    @MessagePattern({ cmd: 'learning.question.delete' })
    async delete(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.questionService.delete(requester, id);
    }

    @MessagePattern({ cmd: 'learning.question.deleteMany' })
    async deleteMany(@Payload() data: { questionIds: string[], requester: Requester }) {
        const { questionIds, requester } = data;
        return this.questionService.deleteMany(requester, questionIds);
    }

    @MessagePattern({ cmd: 'learning.question.approve' })
    async approve(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.questionService.approve(requester, id);
    }

    @MessagePattern({ cmd: 'learning.question.deactivate' })
    async deactivate(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.questionService.deactivate(requester, id);
    }

    @MessagePattern({ cmd: 'learning.question.reject' })
    async reject(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.questionService.reject(requester, id);
    }

    @MessagePattern({ cmd: 'learning.question.sendForReview' })
    async sendForReview(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.questionService.sendForReview(requester, id);
    }
}

