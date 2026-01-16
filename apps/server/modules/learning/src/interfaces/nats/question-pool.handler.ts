import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { QUESTION_POOL_SERVICE_TOKEN, IQuestionPoolService } from '../../interfaces/services/i-question-pool.service';
import { QuestionPoolCreateDTO, QuestionPoolUpdateDTO, QuestionPoolQueryDTO } from '@workspace/schemas';

@Controller()
export class QuestionPoolHandler {
    constructor(
        @Inject(QUESTION_POOL_SERVICE_TOKEN)
        private readonly questionPoolService: IQuestionPoolService,
    ) { }

    @MessagePattern({ cmd: 'learning.question-pool.findAll' })
    async findAll(@Payload() query: QuestionPoolQueryDTO) {
        return this.questionPoolService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.question-pool.findOne' })
    async findOne(@Payload() data: { id: string }) {
        return this.questionPoolService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'learning.question-pool.getByCourse' })
    async getByCourse(@Payload() data: { courseId: string }) {
        return this.questionPoolService.getByCourse(data.courseId);
    }

    @MessagePattern({ cmd: 'learning.question-pool.getByLesson' })
    async getByLesson(@Payload() data: { lessonId: string }) {
        return this.questionPoolService.getByLesson(data.lessonId);
    }

    @MessagePattern({ cmd: 'learning.question-pool.getByJlptLevel' })
    async getByJlptLevel(@Payload() data: { jlptLevel: string }) {
        return this.questionPoolService.getByJlptLevel(data.jlptLevel);
    }

    @MessagePattern({ cmd: 'learning.question-pool.create' })
    async create(@Payload() data: QuestionPoolCreateDTO & { userId: string }) {
        const { userId, ...dto } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.questionPoolService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.question-pool.update' })
    async update(@Payload() data: QuestionPoolUpdateDTO & { id: string, userId: string }) {
        const { id, userId, ...dto } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.questionPoolService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.question-pool.delete' })
    async delete(@Payload() data: { id: string, userId: string }) {
        const { id, userId } = data;
        const requester = { sub: userId, role: 'INSTRUCTOR' as any, permissions: [] };
        return this.questionPoolService.delete(requester, id);
    }
}
