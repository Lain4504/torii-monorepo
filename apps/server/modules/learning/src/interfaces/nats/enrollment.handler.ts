import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { ENROLLMENT_SERVICE_TOKEN, IEnrollmentService } from '@server/learning/interfaces/services';
import { EnrollmentCreateDTO, EnrollmentQueryDTO } from '@workspace/schemas';

@Controller()
export class EnrollmentHandler {
    constructor(
        @Inject(ENROLLMENT_SERVICE_TOKEN) private readonly enrollmentService: IEnrollmentService
    ) { }

    @MessagePattern({ cmd: 'learning.enrollment.findAll' })
    async findAll(@Payload() query: EnrollmentQueryDTO) {
        return this.enrollmentService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.enrollment.findOne' })
    async findOne(@Payload() data: { id: string }) {
        return this.enrollmentService.findOne(data.id);
    }

    @MessagePattern({ cmd: 'learning.enrollment.check' })
    async checkEnrollment(@Payload() data: { userId: string, courseId: string }) {
        const enrollment = await this.enrollmentService.findByUserAndCourse(data.userId, data.courseId);
        return {
            isEnrolled: enrollment !== null && (enrollment.completionStatus === 'in_progress' || enrollment.completionStatus === 'completed'),
            enrollment: enrollment || undefined,
        };
    }

    @MessagePattern({ cmd: 'learning.enrollment.create' })
    async create(@Payload() data: EnrollmentCreateDTO & { userId: string }) {
        const { userId, ...input } = data;
        return this.enrollmentService.create(userId, input);
    }

    @MessagePattern({ cmd: 'learning.enrollment.activate' })
    async activate(@Payload() data: { enrollmentId: string }) {
        return this.enrollmentService.activateEnrollment(data.enrollmentId);
    }

    @MessagePattern({ cmd: 'learning.enrollment.updateProgress' })
    async updateProgress(@Payload() data: { id: string, completionPercentage: number }) {
        return this.enrollmentService.updateProgress(data.id, data.completionPercentage);
    }

    @MessagePattern({ cmd: 'learning.enrollment.updateOrderId' })
    async updateOrderId(@Payload() data: { id: string, orderId: string }) {
        return this.enrollmentService.updateOrderId(data.id, data.orderId);
    }

    @MessagePattern({ cmd: 'learning.enrollment.isEnrolled' })
    async isEnrolled(@Payload() data: { userId: string, courseId: string }) {
        return this.enrollmentService.isEnrolled(data.userId, data.courseId);
    }

    @MessagePattern({ cmd: 'learning.enrollment.delete' })
    async delete(@Payload() data: { userId: string, courseId: string }) {
        return this.enrollmentService.deleteByUserAndCourse(data.userId, data.courseId);
    }
}

