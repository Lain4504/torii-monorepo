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

    @MessagePattern({ cmd: 'learning.enrollment.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.enrollmentService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.enrollment.check' })
    async checkEnrollment(@Payload() data: { userId: string, courseRunId: string }) {
        return this.enrollmentService.checkEnrollmentDetails(data.userId, data.courseRunId);
    }

    @MessagePattern({ cmd: 'learning.enrollment.create' })
    async create(@Payload() data: EnrollmentCreateDTO & { userId: string }) {
        const { userId, ...input } = data;
        return this.enrollmentService.create(userId, input);
    }

    @MessagePattern({ cmd: 'learning.enrollment.createTrial' })
    async createTrial(@Payload() data: { userId: string; courseRunId: string }) {
        return this.enrollmentService.createTrial(data.userId, { courseRunId: data.courseRunId });
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

    @MessagePattern({ cmd: 'learning.enrollment.checkAccess' })
    async checkAccess(@Payload() data: { userId: string, courseMasterId: string, lessonId?: string }) {
        return this.enrollmentService.checkAccess(data.userId, data.courseMasterId, data.lessonId);
    }

    @MessagePattern({ cmd: 'learning.enrollment.getAccessibleLessonIds' })
    async getAccessibleLessonIds(@Payload() data: { userId: string, courseMasterId: string }) {
        return this.enrollmentService.getAccessibleLessonIds(data.userId, data.courseMasterId);
    }

    @MessagePattern({ cmd: 'learning.enrollment.isEnrolled' })
    async isEnrolled(@Payload() data: { userId: string, courseMasterId: string }) {
        return this.enrollmentService.isEnrolled(data.userId, data.courseMasterId);
    }

    @MessagePattern({ cmd: 'learning.enrollment.delete' })
    async delete(@Payload() data: { userId: string, courseRunId: string }) {
        return this.enrollmentService.deleteByUserAndCourseRun(data.userId, data.courseRunId);
    }

    @MessagePattern({ cmd: 'learning.enrollment.upgradeVersion' })
    async upgradeVersion(@Payload() data: { userId: string, courseMasterId: string }) {
        return this.enrollmentService.upgradeVersion(data.userId, data.courseMasterId);
    }
}

