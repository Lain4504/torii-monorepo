import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QAService } from '../../modules/qa/qa.service';
import { QACreateDTO, QAUpdateDTO, QAQueryDTO } from '@workspace/schemas';

@Controller()
export class QAHandler {
    constructor(private readonly qaService: QAService) { }

    @MessagePattern('qa.create')
    async create(@Payload() data: { userId: string; dto: QACreateDTO }) {
        return this.qaService.createQA(data.userId, data.dto);
    }

    @MessagePattern('qa.findAll')
    async findAll(@Payload() data: { query: QAQueryDTO; userId?: string }) {
        return this.qaService.findAllQAs(data.query, data.userId);
    }

    @MessagePattern('qa.findById')
    async findById(@Payload() data: { id: string; userId?: string }) {
        return this.qaService.findQAById(data.id, data.userId);
    }

    @MessagePattern('qa.toggleLike')
    async toggleLike(@Payload() data: { id: string; userId: string }) {
        return this.qaService.toggleLike(data.id, data.userId);
    }



    @MessagePattern('qa.delete')
    async delete(@Payload() data: { id: string; userId: string }) {
        return this.qaService.deleteQA(data.id, data.userId);
    }
}
