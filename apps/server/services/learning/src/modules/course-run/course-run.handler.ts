import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { COURSE_RUN_SERVICE_TOKEN, ICourseRunService } from '@server/learning/interfaces/services';
import { CourseRunCreateDTO, CourseRunUpdateDTO, Requester, CourseRunSearchRequestDTO } from '@workspace/schemas';

@Controller()
export class CourseRunHandler {
    constructor(
        @Inject(COURSE_RUN_SERVICE_TOKEN)
        private readonly courseRunService: ICourseRunService,
    ) { }

    @MessagePattern({ cmd: 'learning.courserun.create' })
    async create(@Payload() data: CourseRunCreateDTO & { requester: Requester }) {
        const { requester, ...dto } = data;
        return this.courseRunService.create(requester, dto);
    }

    @MessagePattern({ cmd: 'learning.courserun.update' })
    async update(@Payload() data: CourseRunUpdateDTO & { id: string, requester: Requester }) {
        const { id, requester, ...dto } = data;
        return this.courseRunService.update(requester, id, dto);
    }

    @MessagePattern({ cmd: 'learning.courserun.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.courseRunService.findById(data.id);
    }

    @MessagePattern({ cmd: 'learning.courserun.findBySlug' })
    async findBySlug(@Payload() data: { slug: string }) {
        return this.courseRunService.findBySlug(data.slug);
    }

    @MessagePattern({ cmd: 'learning.courserun.findAll' })
    async findAll(@Payload() query: CourseRunSearchRequestDTO) {
        return this.courseRunService.findAll(query);
    }

    @MessagePattern({ cmd: 'learning.courserun.updateStatus' })
    async updateStatus(@Payload() data: { id: string, status: any, requester: Requester }) {
        const { id, status, requester } = data;
        return this.courseRunService.updateStatus(requester, id, status);
    }

    @MessagePattern({ cmd: 'learning.courserun.getStudents' })
    async getStudents(@Payload() data: { id: string, page?: number, limit?: number }) {
        const { id, page, limit } = data;
        return this.courseRunService.getStudentsByCourseRun(id, page, limit);
    }

    @MessagePattern({ cmd: 'learning.courserun.delete' })
    async delete(@Payload() data: { id: string, requester: Requester }) {
        const { id, requester } = data;
        return this.courseRunService.delete(requester, id);
    }
}
