import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RefundService } from './refund.service';
import { RefundQueryDTO, CreateRefundDTO, UpdateRefundStatusDTO } from '@workspace/schemas';

@Controller()
export class RefundHandler {
    constructor(private readonly refundService: RefundService) { }

    @MessagePattern({ cmd: 'academy.refund.findAll' })
    findAll(@Payload() query: RefundQueryDTO) {
        return this.refundService.findAll(query);
    }

    @MessagePattern({ cmd: 'academy.refund.findById' })
    findById(@Payload() data: { id: string }) {
        return this.refundService.findById(data.id);
    }

    @MessagePattern({ cmd: 'academy.refund.create' })
    create(@Payload() data: CreateRefundDTO & { requesterId?: string }) {
        const { requesterId, ...dto } = data;
        return this.refundService.createRefund(dto, requesterId);
    }

    @MessagePattern({ cmd: 'academy.refund.updateStatus' })
    updateStatus(@Payload() data: { id: string; dto: UpdateRefundStatusDTO; requesterId?: string }) {
        return this.refundService.updateStatus(data.id, data.dto, data.requesterId);
    }
}
